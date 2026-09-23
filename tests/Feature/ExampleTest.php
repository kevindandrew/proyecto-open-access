<?php

it('redirects guests at the root to the login screen', function () {
    $response = $this->get('/');

    $response->assertRedirect(route('login'));
});
