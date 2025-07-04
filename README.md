<div id="top"></div>

[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<br />
<div align="center">
  
  <h2 align="center">RealTalk</h2>

  <p align="center">
    A real-time chat application built with Next.js, NestJS, and GraphQL.
    <br />
    <a href="https://github.com/JulesEfrei/RealTalk/issues">Report Bug</a>
    ·
    <a href="https://github.com/JulesEfrei/RealTalk/pulls">Request Feature</a>
  </p>
</div>

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
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap / Features</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#credit">Credit</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project

RealTalk is a real-time chat application that allows users to create conversations and exchange messages instantly. The project is built with a modern technology stack, featuring a Next.js frontend and a NestJS backend, with GraphQL for API communication.

**State of the Project:** Alpha

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

- [Next.js](https://nextjs.org/)
- [NestJS](https://nestjs.com/)
- [GraphQL](https://graphql.org/)
- [Prisma](https://www.prisma.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Docker](https://www.docker.com/)

<p align="right">(<a href="#top">back to top</a>)</p>

## Getting Started

To get a local copy up and running follow these simple steps.

Requirements: **Docker.**

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/JulesEfrei/RealTalk.git
   ```
2. Set up your environment variables by copying `.env.dist` to `.env` and filling in the required values.
3. Run the project

   ```sh
   # Devevelopment mode
   make dev-up

   # Production mode
   make prod-up
   ```

   (More utils command in the `Makefile`)

<p align="right">(<a href="#top">back to top</a>)</p>

## Usage

Once the application is running, you can access the web interface at `http://localhost:3000`.
The GraphQL API is available at `http://localhost:3001/graphql`.

<p align="right">(<a href="#top">back to top</a>)</p>

## Roadmap

- [x] User authentication
- [x] Real-time messaging
- [x] Create and manage conversations
- [x] User profiles

See the [open issues](https://github.com/JulesEfrei/RealTalk/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>

## Credit

- [BRUZEAU Jules](https://github.com/JulesEfrei)
- [ESSLIMANI Younes](https://github.com/YounesEssl)

<p align="right">(<a href="#top">back to top</a>)</p>

## Contact

Jules Bruzeau - [LinkedIn](https://www.linkedin.com/in/jules-bruzeau/)

Project Link: [https://github.com/JulesEfrei/RealTalk](https://github.com/JulesEfrei/RealTalk)

<p align="right">(<a href="#top">back to top</a>)</p>

## License

Distributed under the MIT License.

<p align="right">(<a href="#top">back to top</a>)</p>

[forks-shield]: https://img.shields.io/github/forks/JulesEfrei/RealTalk.svg?style=for-the-badge
[forks-url]: https://github.com/JulesEfrei/RealTalk/network/members
[issues-shield]: https://img.shields.io/github/issues/JulesEfrei/RealTalk.svg?style=for-the-badge
[issues-url]: https://github.com/JulesEfrei/RealTalk/issues
[license-shield]: https://img.shields.io/github/license/JulesEfrei/RealTalk.svg?style=for-the-badge
[license-url]: https://github.com/JulesEfrei/RealTalk/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/jules-bruzeau/
