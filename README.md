# Portfolio Website

Een persoonlijke portfolio-website waar ik mijn projecten, ervaring, skills en cv toelicht. Gebouwd met HTML, CSS en JavaScript, en containerized via Docker. De site draait op Nginx en wordt publiek toegankelijk gemaakt via Cloudflared op [stijnvandepol.nl](https://stijnvandepol.nl).

## Functionaliteiten

- Overzicht van projecten, skills en cv
- Responsive design – werkt op mobiel en desktop
- Draait volledig in Docker met Nginx
- Makkelijk uitbreidbaar en aanpasbaar

### Vereisten

- Docker geïnstalleerd

### Installatie

1. Clone de repository:
    ```sh
    git clone https://github.com/stijnvandepol/PortfolioWebsite
    cd PortfolioWebsite
    ```

2. Bouw de Docker container:
    ```sh
    docker build -t portfoliowebsite .
    ```
    
3. Start de Docker container:
    ```sh
    docker run -d -p 80:80 portfoliowebsite
    ```
