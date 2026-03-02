<?php

namespace App\Tests\Integration\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class AuthControllerTest extends WebTestCase
{
    public function testRegisterWithValidData(): void
    {
        $client = static::createClient();
        
        $client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'newuser_' . uniqid() . '@example.com',
                'password' => 'SecurePassword123!',
                'firstName' => 'Test',
                'lastName' => 'User',
                'country' => 'CI',
                'city' => 'Abidjan'
            ])
        );
        
        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message', $responseData);
    }

    public function testRegisterWithInvalidEmail(): void
    {
        $client = static::createClient();
        
        $client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'invalid-email',
                'password' => 'SecurePassword123!',
                'firstName' => 'Test',
                'lastName' => 'User'
            ])
        );
        
        $this->assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testRegisterWithMissingFields(): void
    {
        $client = static::createClient();
        
        $client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'test@example.com'
            ])
        );
        
        $this->assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testLoginWithInvalidCredentials(): void
    {
        $client = static::createClient();
        
        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'nonexistent@example.com',
                'password' => 'wrongpassword'
            ])
        );
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testAccessProtectedRouteWithoutToken(): void
    {
        $client = static::createClient();
        
        $client->request('GET', '/api/me');
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testLogoutWithoutToken(): void
    {
        $client = static::createClient();
        
        $client->request('POST', '/api/logout');
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }
}
