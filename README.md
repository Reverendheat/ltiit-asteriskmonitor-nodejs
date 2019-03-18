# ltiit-asteriskmonitor-nodejs
Monitor employee phone status based on queue activity sent from Asterisk-VOIP AMI interface.

# ServerJS

### Queue Member Added
This comes in to say a SIP user has logged into a new queue. Once they are added to the local database they a web socket is sent to the browser to update the table with relavent information, such as username, queue name, and status.

### Queue Member Removed
This comes in to say a SIP user has logged out of a queue, a web scoket is sent to the browser to remove them from the table, until they log in again.

### Queue Member Status
This fires off when a SIP user status changes. Ringing, On Call, Busy, Invalid, and Hold are all statuses. Based on the status change from AMI, the browser is updated via web sockets and updates the table status.

