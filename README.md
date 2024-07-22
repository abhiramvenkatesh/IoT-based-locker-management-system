# IoT-Based Locker Management System
## Project Overview
The IoT-Based Locker Management System is designed to efficiently manage locker reservations, extensions, and releases.\
The system integrates QR code scanning for easy locker access, and provides a user-friendly interface for managing locker usage.\ 
Built with HTML, CSS, JavaScript, Node.js, and Express.js, this system ensures smooth interaction between users and lockers while maintaining data integrity using text files for storage.

## Features
1. Locker Reservation: Users can reserve a locker by scanning a QR code and selecting an available locker.
2. Locker Extension: Users can extend the reservation duration for their lockers through a simple interface.
3. Locker Release: Users can release their locker when they are done, freeing it up for others to use.
4. Data Management: Locker and user data are stored in text files, ensuring persistent and easy-to-manage data storage.
## Workflow
1. Reservation: Users scan a QR code to access the locker management system and select a locker to reserve.
2. Extension: Users can extend the reservation period of their locker via an interface that allows them to specify the additional time needed.
3. Release: Users can release their locker, removing their data from the system and making the locker available for others.
## User Interaction
1. QR Code Scanning: Users initiate the locker management process by scanning a QR code which directs them to the system's web interface.
2. Web Interface: Users interact with the system via a web interface, where they can perform actions such as reserving, extending, and releasing lockers.
## Data Management
1. Storage: User and locker data are stored in text files. Each locker has an associated file that contains its details, including the reservation status and expiration time.
2. Updates: When a user extends or releases a locker, the corresponding text files are updated to reflect the new status.
## Technologies Used
1. Frontend: HTML, CSS, JavaScript
2. Backend: Node.js, Express.js
3. Data Storage: Text files
## Conclusion
The IoT-Based Locker Management System provides a seamless and efficient way to manage locker reservations and usage. 
By leveraging QR code scanning and a user-friendly web interface, it enhances the user experience and ensures effective locker management. 
The use of text files for data storage keeps the system simple and easy to maintain.
