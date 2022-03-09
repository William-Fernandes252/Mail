# Mail
CS50w Mail Project.

![Inbox page](/screenshots/main.jpg)

## Get Started
The course fourth project consists of a front-end for an email client that makes **asyncronous** calls to a **API** (implemented in **Django**) for sending and receiving of emails.

In adition to the features required in the course, I implemented some custom features, mostly to improve the UX with the interface. Those include:
- A checkbox based menu, where the users can archive and delete **multiple** messages **all at once**;
- A modification in the `PUT /emails/<int:email_id>` endpoint in order to allow the **deletion** of emails;
- A pagination system, where only a certain number of emails are delivered in principle, and more loaded when the user scroll to the end of the page;
- Also, for testint purposes, a wrote a script for the generation of random emails.

In this project, I could learn about
- Design of **interactive and dinamic** user interfaces with **Javascript**;
- Development of **Single Page Applications**, wich are frequently more reliable due to the dinamic update of the pages content that grants a smarter use of both client and server-side processing;
- AJAX calls with the Fetch API;
- Use of **event handlers** alongside with **DOM manipulation** to update the contents of a page and implement interactive interfaces;
- Testing of user interfaces with the Selenium package.

In order to install and run it, follow the steps given bellow.

## Prerequisites
- Last versions of [Python](https://www.python.org/) and [Django](https://www.djangoproject.com/);

## Installing and running
- Clone this repository with `https://github.com/William-Fernandes252/Mail.git`;
- Inside of `/Mail` run `python manage.py runserver`;
- Finally, go to [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

## Project snapshot

<h3 align="center">Email page</h3>

![Email page](/screenshots/email.jpg)

<h3 align="center">Sent mailbox</h3>

![Sent mailbox](/screenshots/sent.jpg)

<h3 align="center">Archived mailbox</h3>

![Archived mailbox](/screenshots/archived.jpg)

<h3 align="center">Compose page</h3>

![Compose page](/screenshots/compose.jpg)

<h3 align="center">Reply page</h3>

![Reply page](/screenshots/reply.jpg)

<h3 align="center">Login page</h3>

![Login page](/screenshots/login.jpg)

<h3 align="center">Registration page</h3>

![Registration page](/screenshots/register.jpg)
