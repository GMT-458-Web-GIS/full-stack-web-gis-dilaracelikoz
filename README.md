🌸 HERITAGE HUNT

[GMT 458 – Web GIS -Final Project Presentatio.pdf](https://github.com/user-attachments/files/24662848/GMT.458.Web.GIS.-Final.Project.Presentatio.pdf)


Live Link (AWS): https://admin.d2b0zwn20jeiri.amplifyapp.com/

PROJECT REQUIREMENTS & IMPLEMENTATIONS

-Managing Different User Types (20%)
The system is designed with three distinct user roles to manage access and ownership:

<img width="754" height="846" alt="image" src="https://github.com/user-attachments/assets/7403da9b-9138-431a-b430-ce9e07d1ebbc" />


Guest (Wanderer): Anonymous users who can explore the map and use the spatial measurement tools.

Hunter (Player): Authenticated users who can play the game, find locations, and track their scores.

Admin: Creator with full access to the Admin Panel to manage spatial data.


-Authentication (15%)

A sign-up and login system is implemented using Firebase Authentication.

Users must be authenticated to save their progress, while guest mode allows quick access without registration.


-CRUD Operations & Filtering (15%)

Users with 'Admin' roles can perform all CRUD operations on the geographical point layer:


<img width="1332" height="773" alt="image" src="https://github.com/user-attachments/assets/bdd032fc-1eb0-44cc-9add-451bd1b5c557" />


Create: Adding new heritage points by clicking directly on the map.

Read: Dynamic listing of all clues and locations in the Admin Panel.

Delete: Instantly removing spatial features via the "DELETE" button.

Filter: Users filter spatial data by choosing between city layers (Ankara/Istanbul).


-NoSQL Database (25%)

Firebase Firestore (NoSQL) was chosen to manage our spatial content.

Value: Unlike relational databases, Firestore allows users to store complex spatial metadata and flexible clue structures as JSON documents, providing faster query response times for real-time gameplay.


-Performance Monitoring & Testing (25% + 25%)

Performance was monitored using Chrome DevTools Lighthouse on the live AWS environment:

<img width="428" height="319" alt="image" src="https://github.com/user-attachments/assets/e6ca36fc-f493-4d54-bb3b-c74279533fff" />


Performance Score: 88/100.

FCP: 0.8s.

Stress Testing: The system remained stable with sub-200ms response times during high-frequency spatial data fetching.

*Firestore’s built-in B-Tree/R-Tree indexing reduced spatial query latency.

-API Development (25%)

The system interacts with a spatial API (Firebase REST API) to manage resources:

GET: To fetch geographical points for the map via getDocs.
POST: To create new spatial features via addDoc.
DELETE: To remove points from the database via deleteDoc.

-Hosting on AWS (20%)
The project is fully hosted and live on AWS Amplify, ensuring high availability and reliable performance for the final presentation.
