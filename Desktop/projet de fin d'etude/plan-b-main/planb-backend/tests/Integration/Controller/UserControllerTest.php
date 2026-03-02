<?php

namespace App\Tests\Integration\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class UserControllerTest extends WebTestCase
{
    public function testGetCurrentUserWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request('GET', '/api/me');
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testUpdateProfileWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request(
            'PUT',
            '/api/me',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'firstName' => 'Updated',
                'lastName' => 'Name'
            ])
        );
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testChangePasswordWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request(
            'POST',
            '/api/me/change-password',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'currentPassword' => 'oldPassword',
                'newPassword' => 'newPassword123!'
            ])
        );
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testGetUserListingsWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request('GET', '/api/me/listings');
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testGetPublicUserProfile(): void
    {
        $client = static::createClient();
        
        // Profil public d'un utilisateur (si l'endpoint existe)
        $client->request('GET', '/api/users/1');
        
        // Peut être 200 ou 404 selon si l'utilisateur existe
        $this->assertContains(
            $client->getResponse()->getStatusCode(),
            [Response::HTTP_OK, Response::HTTP_NOT_FOUND]
        );
    }
}
