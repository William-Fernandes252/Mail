from .models import *
import random
import string


def gen_emails(n: int) -> None:
    """Generates random emails for testing purposes

    Args:
        n (int): Number of emails to generate.
    """
    
    user = User.objects.get(username='william@example.com')
    sender = User.objects.get(username='service@example.com')
    
    for i in range(n):
        randomCode = ''.join(random.choices(string.digits, k = 6))
        subject = 'Your code is ' + randomCode
        email = Email(user=user, sender=sender, subject=subject, body='Sended automatically. Do not answer this message.')
        email.save()
        email.recipients.add(user)
        email.save()