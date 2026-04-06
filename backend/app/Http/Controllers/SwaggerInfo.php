<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="Digital Courses API",
 *     description="API REST da plataforma de cursos online AulasViolão. Autenticação via JWT Bearer Token.",
 *
 *     @OA\Contact(
 *         email="admin@digitalcourses.com",
 *         name="Big Space Creative"
 *     ),
 *
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 *
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="Servidor de desenvolvimento"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Insira o token JWT obtido no login: Bearer {token}"
 * )
 *
 * @OA\Tag(name="Auth",        description="Registro, login, logout e refresh de tokens")
 * @OA\Tag(name="Perfil",      description="Consulta e atualização do perfil do usuário autenticado")
 * @OA\Tag(name="Cursos",      description="Listagem e visualização de cursos e aulas")
 * @OA\Tag(name="Admin",       description="Painel administrativo — acesso restrito a admins")
 * @OA\Tag(name="Admin/Users", description="Gerenciamento de usuários pelo admin")
 * @OA\Tag(name="Admin/Courses", description="Gerenciamento de cursos pelo admin")
 */
class SwaggerInfo {}
