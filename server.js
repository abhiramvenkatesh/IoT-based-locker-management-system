const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const userFilePath = path.join(__dirname, 'users.txt');
let lockerDataFilePath = null;
const lockerFilePath = path.join(__dirname, 'locker.txt');

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let currentUserPhone = '';
let scannedFileLocation = '';
let userLockers=[];

app.post('/login', (req, res) => {
    const { phone } = req.body;
    currentUserPhone = phone;

    if (!fs.existsSync(userFilePath)) {
        fs.writeFileSync(userFilePath, '', 'utf8');
    }

    const data = fs.readFileSync(userFilePath, 'utf8');
    const users = data.split('\n').filter(Boolean).map(line => {
        const [storedPhone, storedName] = line.split(',');
        return { phone: storedPhone, name: storedName };
    });

    const user = users.find(user => user.phone === phone);

    if (!user) {
        res.json({ success: true, newUser: true });
    } else {
        res.json({ success: true, newUser: false });
    }
});

app.post('/register', (req, res) => {
    const { phone, name } = req.body;

    const newUser = `${phone},${name}\n`;
    fs.appendFileSync(userFilePath, newUser, 'utf8');

    res.json({ success: true });
});

app.get('/getUserData', (req, res) => {
    // Check if user file exists
    if (!fs.existsSync(userFilePath)) {
        return res.json({ success: false, message: 'User file not found' });
    }

    // Read user data from file
    const userData = fs.readFileSync(userFilePath, 'utf8');
    const users = userData.split('\n').filter(Boolean).map(line => {
        const [phone, name] = line.split(',');
        return { phone, name };
    });

    // Find the current user
    const user = users.find(user => user.phone === currentUserPhone);

    // Check if locker file exists, create if it doesn't
    if (!fs.existsSync(lockerFilePath)) {
        fs.writeFileSync(lockerFilePath, '', 'utf8');
    }

    // Read locker data from file
    const lockerData = fs.readFileSync(lockerFilePath, 'utf8');
    const lockers = lockerData.split('\n').filter(Boolean).map(line => {
        const [phone, locker, fileName, expiry] = line.split(',');
        return { phone, locker, fileName, expiry };
    });

    // Log the parsed lockers
    console.log('Lockers:', lockers);

    // Filter and map user lockers with expiry time
     userLockers = lockers
        .filter(locker => locker.phone === currentUserPhone)
        .map(locker => ({ locker: locker.locker, expiry: locker.expiry, fileName: locker.fileName }));

    // Log the user lockers
    console.log('User Lockers:', userLockers);

    // Respond with user data and their lockers
    if (user) {
        res.json({ success: true, name: user.name, lockers: userLockers });
    } else {
        res.json({ success: false, message: 'User not found' });
    }
});

app.post('/setLockerDataFile', (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).json({ success: false, message: 'Filename is required' });
    }
    
    try {
        lockerDataFilePath = path.join(__dirname, filename);
        if (!fs.existsSync(lockerDataFilePath)) {
            fs.writeFileSync(lockerDataFilePath, '', 'utf8');
            console.log(`File created: ${lockerDataFilePath}`);
        } else {
            console.log(`File already exists: ${lockerDataFilePath}`);
        }

        res.json({ success: true, message: 'Locker data file set successfully' });
    } catch (error) {
        console.error('Error setting locker data file:', error);
        res.status(500).json({ success: false, message: 'Failed to set locker data file' });
    }
});

app.post('/getLockerData', (req, res) => {
    const { fileName } = req.body;
    
    if (!fs.existsSync(lockerDataFilePath)) {
        return res.status(404).json({ success: false, message: 'Locker data file not found' });
    }

    const lockerData = fs.readFileSync(lockerDataFilePath,'utf8');
    const occupiedLockers = lockerData.split('\n').filter(Boolean).map(line => {
        const [lockerId, expiryTime] = line.split(',');
        return { lockerId, expiryTime,lockerDataFilePath };
    });

    res.json({ occupiedLockers });
});

app.get('/getLockerExpiryTimeFromUserFile', (req, res) => {
    const { lockerId} = req.query;

    if (!fs.existsSync(file)) {
        return res.status(404).json({ success: false, message: 'File not found' });
    }

    const lockerData = fs.readFileSync(lockerFilePath, 'utf8');
    const occupiedLockers = lockerData.split('\n').filter(Boolean).map(line => {
        const [num,id,path,expiryTime] = line.split(',');
        return { lockerId: id, expiryTime };
    });

    const locker = occupiedLockers.find(locker => locker.lockerId === lockerId);
    if (locker) {
        res.json(locker);
    } else {
        res.status(404).json({ success: false, message: 'Locker not found' });
    }
});

app.post('/selectLocker', (req, res) => {
    const { lockerId, duration, phoneNumber, fileName } = req.body;

    if (!lockerId || !duration || !phoneNumber || !fileName) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const lockerDataFilePath = path.join(__dirname, fileName);
    const lockerFilePath = path.join(__dirname, 'locker.txt'); // Replace with your user data file path

    const expiryTime = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();

    const lockerEntry = `${lockerId},${expiryTime}\n`;
    const userEntry = `${currentUserPhone},${lockerId},${fileName},${expiryTime}\n`;

    try {
        fs.appendFileSync(lockerDataFilePath, lockerEntry, 'utf8');
        fs.appendFileSync(lockerFilePath, userEntry, 'utf8');
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error appending data:', error);
        res.status(500).json({ success: false, message: 'Failed to append data' });
    }
});

// endpoint for releasing the locker
app.post('/releaseLocker', (req, res) => {
    const { lockerId, filetoberemoved } = req.body;
    console.log("files are:",lockerDataFilePath,filetoberemoved);
    if (!lockerDataFilePath || !filetoberemoved) {
        return res.status(500).json({ success: false, message: 'Locker data file not set' });
    }
    const file_modify_dir=path.join(__dirname,filetoberemoved);
    try {
        if (lockerDataFilePath === file_modify_dir) {
            // Remove locker from locker data file
            const lockerData = fs.readFileSync(lockerDataFilePath, 'utf8');
            const updatedLockerData = lockerData.split('\n').filter(line => {
                return !line.startsWith(`${lockerId},`);
            }).join('\n') +'\n';
            fs.writeFileSync(lockerDataFilePath, updatedLockerData, 'utf8');

            // Remove locker from lockers.txt
            const lockerFileData = fs.readFileSync(lockerFilePath, 'utf8');
            const updatedLockerFileData = lockerFileData.split('\n').map(line => {
                const parts = line.split(',');
                if ((parts.length >= 4) && (parts[0].trim()===currentUserPhone.toString()) && (parts[1].trim() === lockerId.toString()) && (parts[2].trim()===filetoberemoved.toString())) {
                    console.log("locker is being released");
                    return ''; // Remove the line by replacing it with an empty string
                }
                return line; // Keep the line as it is
            }).filter(line => line !== '').join('\n') +'\n'; // Filter out empty lines and join
            console.log("the newly list contents",updatedLockerFileData);
            fs.writeFileSync(lockerFilePath, updatedLockerFileData, 'utf8');
        } else {
            // Paths are not the same, return error message
            return res.status(400).json({ success: false, message: 'Locker do not match' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error releasing locker:', error);
        res.status(500).json({ success: false, message: 'Failed to release locker' });
    }
});

// Endpoint to extend locker expiry
app.post('/extendLocker', (req, res) => {
    const { lockerId, dir } = req.body;

    if (!lockerId || !dir) {
        return res.status(400).json({ success: false, message: 'Invalid request data' });
    }

    console.log(`Received request to extend locker ${lockerId} in directory ${dir}`);
    console.log(`userLockers:`, userLockers);

    // Find the locker in userLockers
    const lockerToUpdate = userLockers.find(locker => locker.locker === lockerId && locker.fileName === dir);
    console.log("lockerToUpdate:", lockerToUpdate);

    if (!lockerToUpdate) {
        console.log('Locker not found');
        return res.status(404).json({ success: false, message: 'Locker not found' });
    }

    try {
        // Extend expiry time by 24 hours
        const currentExpiry = new Date(lockerToUpdate.expiry);
        const newExpiry = new Date(currentExpiry.getTime() + (24 * 60 * 60 * 1000)); // Add 24 hours
        lockerToUpdate.expiry = newExpiry.toISOString();

        // Read the file contents
        const lockerTxtContent = fs.readFileSync(lockerFilePath, 'utf8');
        const lockerLines = lockerTxtContent.split('\n');

        // Modify the necessary part in the buffer
        const updatedLockerLines = lockerLines.map(line => {
            const parts = line.split(',');
            if (parts.length >= 4 && parts[1].trim() === lockerId.toString() && parts[2].trim() === dir) {
                parts[3] = newExpiry.toISOString(); // Update expiry time in locker.txt
            }
            return parts.join(',');
        });

        // Join the modified content
        const updatedLockerTxtContent = updatedLockerLines.join('\n');

        // Write the modified content back to the file
        fs.writeFileSync(lockerFilePath, updatedLockerTxtContent, 'utf8');

        // Update the expiry time in the associated file (fileName)
        const fileToUpdate = path.join(__dirname, lockerToUpdate.fileName);
        const fileContent = fs.readFileSync(fileToUpdate, 'utf8');
        const filelines=fileContent.split('\n');
        
        // modifying the contents
        const updatefilelines=filelines.map(line =>{
            const filepart=line.split(',');
            if (filepart.length >=2 && filepart[0]===lockerId.toString()){
                filepart[1]=newExpiry.toISOString();
            }
            return filepart.join(',');
        })

        // joining the modified file contents
        const updatedfilecontents=updatefilelines.join('\n');

        // Write the updated JSON back to the file
        fs.writeFileSync(fileToUpdate, updatedfilecontents, 'utf8');

        console.log(`Locker ${lockerId} extended successfully`);

        // Respond with success
        res.json({ success: true });
    } catch (error) {
        console.error('Error extending locker expiry:', error); // Log specific error details
        res.status(500).json({ success: false, message: 'Failed to extend locker expiry' });
    }
});

// Endpoint to handle QR code scanning
app.post('/scanQRCode', (req, res) => {
    const { scannedFile } = req.body;
    
    if (!scannedFile) {
        return res.status(400).json({ success: false, message: 'Scanned file location is required' });
    }

    scannedFileLocation = scannedFile;
    
    res.json({ success: true, message: 'QR code scanned successfully, add locker button is now visible' });
});

// Ensure server resets the lockerDataFilePath and scannedFileLocation on startup
lockerDataFilePath = null;
scannedFileLocation = '';
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
