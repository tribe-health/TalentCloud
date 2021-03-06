<?php
/*
|--------------------------------------------------------------------------
| Error Language Lines
|--------------------------------------------------------------------------
|
| The following language lines are used by exception messages.
|
*/
return [
    'title' => 'Erreur',
    'refresh_page' => 'Veuillez actualiser la page.',
    'two_factor_required' => 'Vous devez activer l\'authentification à deux facteurs pour accéder à cette ressource.',
    'user_must_own_status' => 'Vous n\'avez pas l\'autorisation de déclencher cette transition.',
    'illegal_status_transition' => 'Le changement de statut de :from à :to n\'est pas autorisé.',
    'bad_url' => 'Le url est malformée ou utilise un paramètre d\'interrogation non pris en charge.',
    'email_missing_delivery_address' => 'Impossible d\'envoyer un courriel sans adresse de livraison.',
    'default' => [
        'title' => 'Page non trouvée',
        'header' => 'Le système est incapable de trouver la page que vous cherchez.',
        'paragraph1' => 'Il semble que la page à laquelle vous voulez accéder n\'existe pas ou a été déplacée. Ne vous en faites pas, voici quelques suggestions de pages qui pourraient vous aider à parvenir à vos fins.',
        'links' => [
            '1' => [
                'title' => 'Accueil',
                'url' => '/',
            ],
            '2' => [
                'title' => 'Parcourir les emplois',
                'url' => '/jobs',
            ],
            '3' => [
                'title' => 'FAQ',
                'url' => '/faq',
            ],
            '4' => [
                'title' => 'Portail des talents autochtones',
                'url' => '/indigenous',
            ],
        ],
        'paragraph2' => 'Si vous n\'avez toujours pas trouvé ce que vous cherchez, veuillez <a href="mailto:talent.cloud-nuage.de.talents@tbs-sct.gc.ca" title="Envoyer un courriel au Nuage de talents.">communiquer directement avec nous</a>.',
    ],
];
