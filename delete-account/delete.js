// Deletes a Learning Break parent account from the web, as Google Play requires. The parent
// signs in with their password, then the page calls the same database function as the app
// (delete_my_account), which removes the account and every child's data with it.
// The sign-in lives only in this page's memory: nothing is saved in the browser.
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // Another site could show this page in a frame to trick people into deleting. Don't run there.
  if (window.top !== window.self) {
    document.body.textContent = 'Open this page in its own tab to delete an account.';
    return;
  }

  const config = window.LEARNING_BREAK || {};
  if (!window.supabase || !config.supabaseUrl || !config.supabaseKey) {
    $('setup-problem').hidden = false;
    return;
  }

  const client = window.supabase.createClient(config.supabaseUrl, config.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const signInForm = $('sign-in');
  const confirmForm = $('confirm');

  const say = (el, text) => {
    el.textContent = text;
    el.hidden = !text;
  };

  const busy = (button, label) => {
    button.dataset.label ??= button.textContent;
    button.disabled = Boolean(label);
    button.textContent = label || button.dataset.label;
  };

  const problemText = (e) =>
    e && e.message ? e.message : 'Check the internet connection and try again.';

  const signInProblem = (error) => {
    if (error.code === 'invalid_credentials') return "That email and password don't match a Learning Break account.";
    if (error.code === 'email_not_confirmed') {
      return 'This email was never confirmed, so it can\'t sign in. Email us and we\'ll delete the sign-up.';
    }
    return `Couldn't sign in: ${problemText(error)}`;
  };

  const showSignIn = () => {
    confirmForm.hidden = true;
    signInForm.hidden = false;
    $('password').value = '';
    $('email').focus();
  };

  signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = $('email').value.trim();
    const password = $('password').value;
    const problem = $('sign-in-problem');
    if (!email || !password) {
      say(problem, 'Type your email address and password.');
      return;
    }
    busy($('sign-in-button'), 'Signing in…');
    let result;
    try {
      result = await client.auth.signInWithPassword({ email, password });
    } catch (e) {
      result = { error: e };
    }
    busy($('sign-in-button'), null);
    $('password').value = '';
    if (result.error) {
      say(problem, signInProblem(result.error));
      return;
    }
    say(problem, '');
    $('who').textContent = result.data.user.email;
    $('understand').checked = false;
    $('delete-button').disabled = true;
    say($('delete-problem'), '');
    signInForm.hidden = true;
    confirmForm.hidden = false;
    $('understand').focus();
  });

  $('understand').addEventListener('change', (event) => {
    $('delete-button').disabled = !event.target.checked;
  });

  confirmForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!$('understand').checked) return;
    busy($('delete-button'), 'Deleting…');
    let result;
    try {
      result = await client.rpc('delete_my_account');
    } catch (e) {
      result = { error: e };
    }
    if (result.error) {
      busy($('delete-button'), null);
      say($('delete-problem'), `Couldn't delete the account: ${problemText(result.error)}`);
      return;
    }
    // The account is gone; this only forgets the sign-in in this page.
    await client.auth.signOut({ scope: 'local' }).catch(() => {});
    confirmForm.hidden = true;
    $('done').hidden = false;
    $('here').focus();
  });

  $('cancel').addEventListener('click', async () => {
    await client.auth.signOut({ scope: 'local' }).catch(() => {});
    showSignIn();
  });

  signInForm.hidden = false;
})();
