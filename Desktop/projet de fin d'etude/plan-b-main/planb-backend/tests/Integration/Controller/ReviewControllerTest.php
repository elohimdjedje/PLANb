<?php

namespace App\Tests\Integration\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class ReviewControllerTest extends WebTestCase
{
    public function testGetUserReviews(): void
    {
        $client = static::createClient();
        
        // Les avis sont publics
        $client->request('GET', '/api/users/1/reviews');
        
        // Peut être 200 ou 404 selon si l'utilisateur existe
        $this->assertContains(
            $client->getResponse()->getStatusCode(),
            [Response::HTTP_OK, Response::HTTP_NOT_FOUND]
        );
    }

    public function testCreateReviewWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request(
            'POST',
            '/api/reviews',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'userId' => 1,
                'rating' => 5,
                'comment' => 'Excellent vendeur, très professionnel'
            ])
        );
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testUpdateReviewWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request(
            'PUT',
            '/api/reviews/1',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'rating' => 4,
                'comment' => 'Updated review'
            ])
        );
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testDeleteReviewWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request('DELETE', '/api/reviews/1');
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }
}
