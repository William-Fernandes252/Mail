let counter = 0; 	// Count of emails in the current page
let quantity = 20; 	// Quantity of emails to be delivered in each promise

document.addEventListener('DOMContentLoaded', function () {

	// Set navigation buttons
	document.querySelectorAll('.navigation').forEach(button => {
		button.onclick = () => {
			const section = button.dataset.section;
			if (section !== 'Compose' && section !== 'Log Out') {
				button.addEventListener('click', load_mailbox(button.dataset.section));
			}
			else if (section === 'Compose') {
				button.addEventListener('click', compose_email);
			}
		};
		button.onmouseenter = () => {
			button.innerHTML = button.dataset.section;
		};
		button.onmouseleave = () => {
			button.innerHTML = button.dataset.icon;
		};
	});

	// Set buttons to arquive, delete and select emails
	document.querySelector('#archive').addEventListener('click', () => manage_selected(false));
	document.querySelector('#delete').addEventListener('click', () => manage_selected(true));
	document.querySelector('#check-all').addEventListener('click', () => select_all(true));
	document.querySelector('#uncheck-all').addEventListener('click', () => select_all(false));

	// Action buttons are disabled by default
	document.querySelectorAll('.email-action').forEach(button => {
		button.disabled = true
	});

	// By default, load the inbox
	load_mailbox('Inbox');

	// Send the email in form submition
	document.querySelector('#compose-form').onsubmit = () => {
		const recipients = document.querySelector('#compose-recipients').value;
		const subject = document.querySelector('#compose-subject').value;
		const body = document.querySelector('#compose-body').value;
		fetch('/emails', {
			method: 'POST',
			body: JSON.stringify({
				recipients: recipients,
				subject: subject,
				body: body,
			})
		})
			.then(response => response.json())
			.then(result => {
				load_mailbox('Sent');
			});
	};

});

function toggle_view(selectedViewId) {
	// Display the selected view and enables the email actions depending on view
	const views = document.querySelectorAll('.view');
	views.forEach(view => {
		view.style.display = 'none';
		if (view.id === selectedViewId) {
			view.style.display = 'block';
		}
		if (view.id === 'actions-view') {
			view.style.display = 'block';
			if (selectedViewId === 'compose-view' || selectedViewId === 'email-view') {
				view.style.display = 'none';
			}
		}
	});

	// Disable email actions by default
	document.querySelectorAll('.email-action').forEach(action => {
		action.disabled = true;
	});

	// Reset the list of emails
	counter = 0;
}

function set_arquive_button(mailbox) {
	let set = '';
	let button = document.querySelector('#archive');

	if (mailbox !== 'Archived') {
		set = 'Arquive';
	}
	else {
		set = 'Unarchive';
	}

	button.innerHTML = set + " <i class='bi bi-archive-fill'></i>";

	return set;
}

function compose_email() {

	// Show compose view and hide other views
	toggle_view('compose-view');

	// Clear out composition fields
	document.querySelector('#compose-recipients').value = '';
	document.querySelector('#compose-subject').value = '';
	document.querySelector('#compose-body').value = '';

}

function reply_email(sender, subject, timestamp, body) {

	// Show compose view and hide other views
	toggle_view('compose-view');

	// Pre-fill out composition fields with the content of the email to be replied
	document.querySelector('#compose-recipients').value = sender;
	document.querySelector('#compose-subject').value = subject.startsWith('Re: ') ? subject : 'Re: ' + subject;
	document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote: ${body}\n`;

}

function load_mailbox(mailbox) {

	// Show the mailbox and hide other views
	toggle_view('emails-view');

	// Change the value of the arquive button depending on what view was loaded
	set_arquive_button(mailbox);

	// Show the mailbox name
	const emailsView = document.querySelector('#emails-view');
	emailsView.innerHTML = `<h3 id='header'>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

	// Load the first set of emails
	fetch_emails();

	// Set the event listener to load new emails when the user gets to the end of the page
	window.addEventListener('scroll', function () {
		if (this.innerHeight + this.scrollY >= document.body.offsetHeight) {
			fetch_emails();
		}
	});

	// Load the next set of emails
	function fetch_emails() {

		// Set the start and end of page current list of emails
		start = counter;
		end = counter + quantity - 1;
		counter = end + 1;

		// Retrive and show the mailbox emails
		fetch(`/emails/${mailbox}?start=${start}&end=${end}`)
			.then(response => response.json())
			.then(emails => {
				if (emails.length > 0) {
					emails.forEach(email => {
						let emailTag = document.createElement('div');
						emailsView.append(emailTag);
						emailTag.classList.add('row', 'border', 'rounded', 'bg-light', 'mb-2', 'mx-1', 'p-1', 'email');

						let checkboxTag = document.createElement('div');
						checkboxTag.classList.add('col-auto');
						checkboxTag.innerHTML = `<input type="checkbox" class="email-check" value='${email.id}'>`;
						checkboxTag.addEventListener('change', load_options);
						emailTag.append(checkboxTag);

						for (field in email) {
							let tag = document.createElement('div');
							tag.innerHTML = email[field];
							tag.addEventListener('click', () => load_email(email.id));
							switch (field) {
								case 'sender':
									tag.className = 'col-md-2 text-left pl-0 pr-3 mr-5 font-weight-bold';
									emailTag.append(tag);
									break;
								case 'subject':
									tag.className = 'col-md-auto text-left px-0 mr-2';
									emailTag.append(tag);
									break;
								case 'timestamp':
									tag.className = 'col-md text-right ml-auto font-weight-bold text-muted';
									emailTag.append(tag);
									break;
							}
						}
					});

					// Disable emails checkboxes when in sent mailbox
					if (mailbox === 'Sent') {
						document.querySelectorAll('.email-check').forEach(checkbox => {
							checkbox.disabled = true;
						});
						// Reset the archive button
						set_arquive_button(mailbox);
					}
				}
				else {
					let emptyMailBoxTag = document.createElement('div');
					emptyMailBoxTag.innerHTML = 'Empty Mailbox.';
					emailsView.append(emptyMailBoxTag);
					window.removeEventListener('scroll');
				}
			});
	}
}

function load_email(email_id) {

	// Show the email view and hide other views
	toggle_view('email-view');

	// Select and clear the email view
	const emailView = document.querySelector('#email-view');
	while (emailView.lastChild && emailView.lastChild.id !== 'delete-btn') {
		emailView.removeChild(emailView.lastChild);
	}

	// Retrieve and diplay the email content
	fetch(`/emails/${email_id}`)
		.then(response => response.json())
		.then(email => {
			if (email.hasOwnProperty('error')) {
				errorTag = document.createElement('p');
				errorTag.innerHTML = `Error: ${email.error}`;
				errorTag.className = 'alert alert-danger';
				emailView.append(errorTag);
			}
			else {
				for (field in email) {
					let tag = document.createElement('p');
					switch (field) {
						case 'sender':
							tag.innerHTML = `<b>From: </b>${email.sender}`;
							emailView.append(tag);
							break;
						case 'recipients':
							tag.innerHTML = `<b>To: </b>${email['recipients'].join(', ')}`;
							emailView.append(tag);
							break;
						case 'subject':
							tag.innerHTML = `<b>Subject: </b>${email.subject}`;
							emailView.append(tag);
							break;
						case 'timestamp':
							tag.innerHTML = `<b>Timestamp: </b>${email.timestamp}`;
							emailView.append(tag);
							break;
					}
				}

				let replyButton = document.querySelector('#reply-btn')
				replyButton.addEventListener('click', () => reply_email(email.sender, email.subject, email.timestamp, email.body));

				let arquiveButton = document.querySelector('#archive-btn');
				arquiveButton.innerHTML = document.querySelector('#archive').innerHTML;
				arquiveButton.addEventListener('click', () => manage_email(email.id, document.querySelector('#archive').innerHTML.charAt(0) === 'A'), false);

				let deleteButton = document.querySelector('#delete-btn');
				deleteButton.addEventListener('click', () => manage_email(email.id, false, true));

				emailView.append(document.createElement('hr'));

				let body = document.createElement('p');
				body.innerHTML = email.body;
				emailView.append(body);
			}
		});

	// Mark the email as read;
	fetch(`/emails/${email_id}`, {
		method: 'PUT',
		body: JSON.stringify({
			read: true
		})
	})
		.then(response => {
			if (response.status !== 204) {
				console.log(response);
			}
		});
}

function load_options() {
	// Enable the actions for the emails if at least one checkbox is checked
	let actionButtons = document.querySelectorAll('.email-action');
	actionButtons.forEach(button => {
		button.disabled = true;
	});
	document.querySelectorAll('.email-check').forEach(checkbox => {
		if (checkbox.checked) {
			actionButtons.forEach(button => {
				button.disabled = false;
			});
		}
	});
}

function manage_email(email_id, arch, del) {
	fetch(`/emails/${email_id}`, {
		method: 'PUT',
		body: JSON.stringify({
			archived: del ? false : arch,
			deleted: del
		})
	})
		.then(response => {
			if (response.status !== 204) {
				console.log(response);
			}
			load_mailbox('Inbox');
		});
}

function manage_selected(del) {
	// Arquive emails which the checkbox is checked
	document.querySelectorAll('.email-check').forEach(checkbox => {
		if (checkbox.checked) {
			manage_email(parseInt(checkbox.value), document.querySelector('#archive').innerHTML.charAt(0) === 'A', del);
		}
	});
}

function select_all(activate) {
	document.querySelectorAll('.email-check').forEach(checkbox => {
		checkbox.checked = activate;
	});
}