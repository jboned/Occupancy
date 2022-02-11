<div id="top"></div>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/jboned/Occupancy">
    <img src="images/logo.jpg" alt="Logo">
  </a>

<h3 align="center">Occupancy</h3>

  <p align="center">
    This master's thesis project presents a secure real-time occupancy control system in which the omnipresence of decentraliced technologies stands out, through the storage (using the IPFS file system), sending (using the Streamr platform), automated management (using Smart Contracts of the Blockchain) and security (using the NuCypher network) of the data.
  </p>

  ![Home Screen Shot][home-screenshot]

  <p align="center">
    This project will consist of the development of a decentralised web application (implemented in Angular) that allows users of the system to consult (through a system of paid subscriptions) in real time the capacity of restaurants in Malaga. To achieve the decentralised architecture, use will be made of BlockChain technologies, using the NuCypher network to ensure the management of data security, the Streamr tool to guarantee the exchange of information in real time, and Smart Contracts to achieve an execution logic in the network itself. In addition, it makes use of IPFS to store the non-confidential information of the hospitality venues participating in the system.
  </p>  
  <p align="center">
    This work also includes the capture and sending of data through a system of sensors distributed throughout the sensors distributed throughout the hotel and catering establishments in Malaga, monitored by Raspberry devices that Raspberry devices that continuously control this capacity and publish it on Streamr. In addition, these devices also offer a small web interface for the owners to consult the data they are collecting.
  </p>
   <p align="center">
    <br />
    <a href="https://github.com/jboned/FutJoin"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/jboned/FutJoin">View Demo</a>
    ·
    <a href="https://github.com/jboned/FutJoin/issues">Report Bug</a>
    ·
    <a href="https://github.com/jboned/FutJoin/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project
This work covers the area of the diagram inside the blue figure: on the one hand, the Raspberry device will collect data through its sensors (simulated for this project) and encrypting them. Subsequently, it will publish them through a decentralised pub/sub protocol based on Blockchain, called Streamr. This will avoid having a single critical point of failure. The Raspberry device will perform these actions through a small web application that, in addition to these functionalities, will display the data and collect statistics about them in real time.

![Product Name Screen Shot][product-screenshot]

On the other hand, the users of the system (each one corresponding to a "Bob" in the diagram), thorugh a web application developed in Angular,  will be able to suscribe to the restaurants and check their occupancy data in real time.

The public information of these venues (such as name or location) will be published on the IPFS network and shared on the Blockchain through a Smart Contract. For this reason, the application is able to access this information and show it to users through a simple and beautiful interface.

Through this Smart Contract, users (Bobs) will pay a certain amount of money for subscriptions to the restaurants through their Ethereum wallet and, once the payment is verified, the restaurant (Alice in the diagram) will manage the Bob's access to the data using the NuCypher network.

Subsequently, the users (Bobs) will collect the (encrypted) data from the Raspberry via Streamr and, since Alice will have added the respective necessary policies, NuCypher will detect if the user is subscribed to the system and will "re-encrypted" the data to prevent bob from accessing it.

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

* [Ethereum](https://ethereum.org)
* [NuCypher](https://www.nucypher.com/)
* [Streamr](https://streamr.network/)
* [IPFS](https://ipfs.io/)
* [Node.js](https://nodejs.org/)
* [Angular](https://angular.io/)
* [Metamask](https://metamask.io/)
* [Python](https://www.python.org/)
* [Flask](https://flask.palletsprojects.com)
* [Express](https://expressjs.com)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

* PC with operating system: macOS, Linux or Windows.
* A browser (Google chrome recommended) Wiht Metamask extension installed.
* NodeJS (https://nodejs.org/es/download/)
* npm
  ```sh
  npm install npm@latest -g
  ```
* Angular 
  ```sh
  npm install -g @angular/cli
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/jboned/Occupancy.git
   ```
   
## "Bob" application installation.

2. In the 'occupancy' folder, install NPM packages
   ```sh
   npm install
   ```
3. In the 'occupancy' folder, start the Angular application:
   ```sh
   npm serve
   ```
   
## "Enrico" application installation.

4. In the 'enrico' folder, install NPM packages
   ```sh
   npm install
   ```
5. In the 'enrico' folder, start the NodeJS application:
   ```sh
   npm start
   ```
   
## "NuCypher API" application installation.

To install the NuCypher API, you must first run a local node on the Ethereum Goerli network. The Geth tool must first be installed on the system, following these steps:

For MacOS (with Homebrew):
   ```sh
   brew tap ethereum/ethereum
   brew install ethereum
   ```
For Ubuntu:
  ```sh
  sudo add-apt-repository -y ppa:ethereum/Ethereum
  sudo apt-get update
  sudo apt-get install ethereum
  ```
For Windows:
  - Download https://geth.ethereum.org/downloads/
 
After this, the Goerli node must be installed by executing the following command :
 ```sh
  geth --goerli --syncmode fast
 ```
 
6. We will have to wait for the node to download the entire blockchain. Later on, modify the following line of code in the "api.py" file in the API folder:
   ```python
   provider_uri = '<path_to_IPC_node>'.
   ``` 
   
7. In the API folder, run the following command:
   ```sh
   pip install -r requirements.txt
   python api.py
   ```
<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

### Login
The Metamask tool will open and will offer you to choose an account from the ones you have configured in it.

![Login Screen Shot][login-screenshot]

Once the account has been selected, you must sign a random message generated by the application to verify the account keys

### Load User configuration
In this part of the application, if the browser does not have the user data stored for the account, it will let you know via a window offering two possibilities: load a user configuration file or create a new account.

![Config Screen Shot][config-screenshot]

### Create User
In this part of the application, the user must introduces his personal data to the APP (an Alias and a password). Futhermore, the application will display an interactive map with the different areas of different areas of Malaga. The user must select the areas where the restaurants that he/she wants to visualise. Once the user can areas have been selected, the "Restaurant subscriptions" drop-down area will automatically show all the restaurants in that area and the user can choose the restaurants he wants to subscribe.

![Config Screen Shot][config-screenshot]

When these steps are completed, a screen will be displayed to download the user's configuration file or to upload it to Dropbox. user configuration file or to upload it to Dropbox.

![Download Screen Shot][download-screenshot]

### Create User
In this part of the application, the user must introduces his personal data to the APP (an Alias and a password). Futhermore, the application will display an interactive map with the different areas of different areas of Malaga. The user must select the areas where the restaurants that he/she wants to visualise. Once the user can areas have been selected, the "Restaurant subscriptions" drop-down area will automatically show all the restaurants in that area and the user can choose the restaurants he wants to subscribe.

![Config Screen Shot][config-screenshot]

When these steps are completed, a screen will be displayed to download the user's configuration file or to upload it to Dropbox. user configuration file or to upload it to Dropbox.

![Download Screen Shot][download-screenshot]

### View occupancy data
In this part of the application, the user will be able to view to check the real-time occupancy data of the restaurants which he/she is subscribed to. This data will be updated automatically by the restaurants.

![Data Screen Shot][data-screenshot]

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap
- [x] Users
    - [x] Login/Logout with Metamask
    - [x] Create new user (pesonal data)
    - [x] Dropbox funcionality
    - [x] View restaurant data (Streamr Access)
- [x] NuCypher
    - [x] Generate keys in NuCypher network
- [x] Smart Contract Management 
    - [x] Get IPFS hash of Smart Contract.
    - [x] Get Restaurant public information of IPFS file.
    - [x] Restaurant subscription payment from User metamask wallet.
- [x] Enrico App
    - [x] Configuration file.
    - [x] Generate random data periodically.
    - [x] Encrypt Data with NuCypher API
    - [x] Publish data in Streamr

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

Javier Boned López - [![LinkedIn][linkedin-shield]][linkedin-url]
<p align="right">(<a href="#top">back to top</a>)</p>


<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Blockchain] (https://www.blockchain.com/)
* [Smart Contracts] (https://www.ibm.com/topics/smart-contracts)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/jboned/Occupancy.svg?style=for-the-badge
[contributors-url]: https://github.com/jboned/Occupancy/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jboned/Occupancy.svg?style=for-the-badge
[forks-url]: https://github.com/jboned/Occupancy/network/members
[stars-shield]: https://img.shields.io/github/stars/jboned/Occupancy.svg?style=for-the-badge
[stars-url]: https://github.com/jboned/Occupancy/stargazers
[issues-shield]: https://img.shields.io/github/issues/jboned/Occupancy.svg?style=for-the-badge
[issues-url]: https://github.com/jboned/Occupancy/issues
[license-shield]: https://img.shields.io/github/license/jboned/Occupancy.svg?style=for-the-badge
[license-url]: https://github.com/jboned/Occupancy/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/javier-boned-lopez
[product-screenshot]: images/screenshot.png
[home-screenshot]: images/home.png
[login-screenshot]: images/login.png
[config-screenshot]: images/config.png
[download-screenshot]: images/download.png
[data-screenshot]: images/data.png
