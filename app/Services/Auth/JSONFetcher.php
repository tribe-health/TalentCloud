<?php

namespace App\Services\Auth;

use GuzzleHttp\Client;
use App\Services\Contracts\JSONGetter;
use App\Services\Contracts\JSONPoster;

/**
 * Adapted from the OpenIDConnect Laravel package at
 * https://github.com/furdarius/oidconnect-laravel
 */
class JSONFetcher implements JSONGetter, JSONPoster
{
    /**
     * @var \GuzzleHttp\Client
     */
    private $client;
    /**
     * JSONFetcher constructor.
     *
     * @param \GuzzleHttp\Client $client
     */
    public function __construct(Client $client)
    {
        $this->client = $client;
    }
    /**
     * {@inheritdoc}
     */
    public function get(string $url, array $params = [], array $options = []): array
    {
        $reqOpts = array_merge([
            'query' => $params,
            'headers' => [
                'Accept' => 'application/json',
            ],
        ], $options);
        return $this->request("GET", $url, $reqOpts);
    }
    /**
     * @param string $method
     * @param string $url
     * @param array  $options
     *
     * @return array
     */
    protected function request(string $method, string $url, array $options): array
    {
        $response = $this->client->request($method, $url, $options);
        // TODO: Handle request errors (ex.: authorization error with 403 status code)
        $data = $response->getBody()->getContents();
        return json_decode($data, true);
    }
    /**
     * {@inheritdoc}
     */
    public function post(string $url, array $params = [], $body = null, array $options = []): array
    {
        $reqOpts = array_merge([
            'query' => $params,
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/x-www-form-urlencoded',
            ],
            'body' => $body,
        ], $options);
        return $this->request("POST", $url, $reqOpts);
    }
}
