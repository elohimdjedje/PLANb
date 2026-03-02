<?php

namespace App\Tests\Integration\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class ConversationControllerTest extends WebTestCase
{
    public function testGetConversationsWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request('GET', '/api/conversations');
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testGetSingleConversationWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request('GET', '/api/conversations/1');
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testCreateConversationWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request(
            'POST',
            '/api/conversations',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'listingId' => 1,
                'message' => 'Bonjour, je suis intéressé par votre annonce'
            ])
        );
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testSendMessageWithoutAuth(): void
    {
        $client = static::createClient();
        
        $client->request(
            'POST',
            '/api/conversations/1/messages',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'content' => 'Test message'
            ])
        );
        
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }
}
