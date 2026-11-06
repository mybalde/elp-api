export const mailConfirmationFunction = (email: string,token: string) => {
  return (`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
    <title>Compte validé</title>
</head>
<body>
    <p>Bonjour,</p>
    <p>Merci pour votre inscription ! Veuillez cliquer sur le bouton ci-dessous pour valider votre compte :</p>
    <a href="https://votre-site.com/verify-email?email=${email}&${token}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmer mon e-mail</a>
    <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur : https://votre-site.com/verify-email?$email=${email}&{token}</p>
</body>
</html>    
  `)
}

export const mailValidationFunction = (prenom: string, nom : string) => {
  return (`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
    <title>Compte validé</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f9f9f9; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        
        <h2 style="color: #007bff; margin-top: 0;">Félicitations ! Votre compte est activé.</h2>
        
        <p>Bonjour, ${prenom} ${nom}</p>
        
        <p>Nous vous confirmons que votre adresse e-mail a été vérifiée avec succès. Votre compte sur <strong>ELP Finance</strong> est désormais pleinement actif.</p>
        
        <p>Pour pouvoir enfin commencer vos démarches, nous vous invitons à <strong>compléter votre profil</strong> dès maintenant sur votre espace client :</p>
        
        <!-- Bouton d'appel à l'action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://votre-site.com/espace-client" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accéder à mon espace client</a>
        </div>
        
        <p>Un profil complet et à jour nous permettra de vous accompagner au mieux et de lancer vos démarches rapidement.</p>
        
        <p>Si vous avez la moindre question, n'hésitez pas à répondre directement à cet e-mail.</p>
        
        <p style="margin-top: 30px;">À très bientôt,<br><strong>L'équipe ELP Finance</strong></p>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888888; text-align: center;">Ceci est un e-mail automatique, merci de ne pas y répondre directement si ce n'est pas nécessaire.</p>
    </div>
</body>
</html>
    `)
}