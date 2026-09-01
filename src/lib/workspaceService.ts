export async function uploadFileToGoogleDrive(fileName: string, fileContent: string | Blob, mimeType = 'application/pdf') {
  const token = localStorage.getItem('google_workspace_access_token');
  if (!token) {
    throw new Error('Google Workspace OAuth token not found. Please sign in with Google.');
  }

  const metadata = {
    name: fileName,
    mimeType: mimeType,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  
  if (typeof fileContent === 'string') {
    form.append('file', new Blob([fileContent], { type: mimeType }));
  } else {
    form.append('file', fileContent);
  }

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive upload failed: ${errorText}`);
  }

  const data = await res.json();
  return data;
}

export const uploadFileToDrive = uploadFileToGoogleDrive;

export async function listDriveFiles(query = '') {
  const token = localStorage.getItem('google_workspace_access_token');
  if (!token) {
    throw new Error('Google Workspace OAuth token not found. Please sign in with Google.');
  }

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  if (query) {
    url.searchParams.append('q', query);
  }
  url.searchParams.append('fields', 'files(id, name, mimeType, size, modifiedTime, webViewLink)');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive list failed: ${errorText}`);
  }

  const data = await res.json();
  return data.files || [];
}

export async function sendEmailViaGmail(toEmail: string, subject: string, bodyText: string) {
  const token = localStorage.getItem('google_workspace_access_token');
  if (!token) {
    throw new Error('Google Workspace OAuth token not found. Please sign in with Google.');
  }

  const emailLines = [
    `To: ${toEmail}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    bodyText,
  ];

  const emailRaw = emailLines.join('\r\n');
  const base64Encoded = btoa(unescape(encodeURIComponent(emailRaw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64Encoded }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gmail send failed: ${errorText}`);
  }

  return await res.json();
}

export const sendGmailBroadcast = sendEmailViaGmail;

export async function fetchGoogleContacts() {
  const token = localStorage.getItem('google_workspace_access_token');
  if (!token) {
    throw new Error('Google Workspace OAuth token not found. Please sign in with Google.');
  }

  const res = await fetch(
    'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Contacts fetch failed: ${errorText}`);
  }

  const data = await res.json();
  return (data.connections || []).map((c: any) => ({
    name: c.names?.[0]?.displayName || 'Unnamed Contact',
    email: c.emailAddresses?.[0]?.value || '',
    phone: c.phoneNumbers?.[0]?.value || '',
    company: c.organizations?.[0]?.name || 'Contractor/Vendor',
  }));
}
