# Tab.sh

Uma página de nova aba personalizada para o navegador.

![Tab.sh](https://github-production-user-asset-6210df.s3.amazonaws.com/53589614/568717554-b7a2babf-c7e1-4676-8f08-c337c12b7dec.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20260324%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260324T234107Z&X-Amz-Expires=300&X-Amz-Signature=98d8536f6a2fbe3f898e0100454eaaa56947084ccaecc65aa72d5d7e65267b35&X-Amz-SignedHeaders=host)

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
