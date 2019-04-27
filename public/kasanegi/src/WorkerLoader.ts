export class WorkerLoader {
  constructor() {
    this.register();
  }

  public register() {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker
      .register('/kasanegi-service-worker.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
  }
}