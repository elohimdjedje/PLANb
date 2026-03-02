<?php

namespace App\Tests\Integration\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class FavoriteControllerTest extends WebTestCase
{
    public function testGetFavoritesWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request('GET', '/api/favorites');
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testAddFavoriteWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request(
            'POST',
            '/api/favorites',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['listingId' => 1])
        );
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testRemoveFavoriteWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request('DELETE', '/api/favorites/1');
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }
}
