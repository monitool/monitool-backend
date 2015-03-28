module.exports = function(app) {

  function modifyResponse(ctx, model, next) {
      ctx.res.set('Access-Control-Allow-Origin', '*');
      ctx.res.set('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
      ctx.res.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      ctx.res.status(status).end();
  }

  for (var model in app.models) {
      app.models[model].afterRemote('**', modifyResponse);
  }
};