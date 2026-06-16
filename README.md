# TFG — Sistema de Gestión para Peluquería

> Trabajo de Fin de Grado | Ingeniería Informática  
> Licencia: [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

## Stack
| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 18 + Tailwind CSS |
| Backend | NestJS + TypeORM |
| Base de datos | PostgreSQL 16 |
| Documentación | Swagger (OpenAPI 3.0) |
| Contenerización | Docker Compose |

## Puesta en marcha

### Con Docker (recomendado)
\`\`\`bash
cp backend/.env.example backend/.env
docker compose up --build
\`\`\`

### Sin Docker
\`\`\`bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend
cd frontend && npm install && npm start
\`\`\`

## URLs
- **Frontend:** http://localhost:4200
- **API:** http://localhost:3000/api/v1
- **Swagger:** http://localhost:3000/api/docs

## Licencia
Este proyecto está bajo la licencia Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA 4.0).  
Para más información, visita: https://creativecommons.org/licenses/by-sa/4.0/
