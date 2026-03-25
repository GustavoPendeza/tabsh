# Tab.sh

Uma página de nova aba personalizada para o navegador.

![Tab.sh](https://private-user-images.githubusercontent.com/53589614/568730321-3cc3d291-0595-4d79-8094-bba44f1c28ac.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzQzOTg0MzIsIm5iZiI6MTc3NDM5ODEzMiwicGF0aCI6Ii81MzU4OTYxNC81Njg3MzAzMjEtM2NjM2QyOTEtMDU5NS00ZDc5LTgwOTQtYmJhNDRmMWMyOGFjLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjAzMjUlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwMzI1VDAwMjIxMlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWU3MTgzMTBhNTA0YWFlNzNmMjZlMzgwZjBlNGQ2MzM3MzUzMGIyZjFjNmNlNDA5ZmYzYjU4ZWUwNDAzZDAyYmUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.ACjFVrB25zUxK1ehD2sANmKmwLzMJLxcH9t9BjekU7s)

## Funcionalidades

- **Favoritos** — adicione, edite, remova e reordene links por arrastar e soltar
- **Widget de clima** — detecção automática de localização ou cidade manual, atualizado a cada 5 minutos
- **Plano de fundo** — cor sólida (hex) ou imagem por URL/upload
- **Tema** — claro ou escuro
- **Importar/exportar** — salve e restaure favoritos, configurações ou tudo em JSON

## Tecnologias

- [Next.js 15](https://nextjs.org/) com Turbopack
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [Sonner](https://sonner.emilkowal.ski/)
- [Open-Meteo](https://open-meteo.com/) (clima)
- [Nominatim](https://nominatim.org/) (geocodificação)

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.
