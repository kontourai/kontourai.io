export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === 'kontourai.com' || url.hostname === 'www.kontourai.com') {
      url.hostname = 'kontourai.io';
      return Response.redirect(url.toString(), 301);
    }

    if (url.hostname === 'www.kontourai.io') {
      url.hostname = 'kontourai.io';
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
