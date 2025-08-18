export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Arbitrum
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The complete documentation for building, deploying, and operating on Arbitrum's
              Layer 2 scaling solutions.
            </p>
          </div>

          <div className="pt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/docs"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                View Documentation
              </a>
              <a
                href="/docs/build-decentralized-apps/01-quickstart-solidity-remix"
                className="inline-flex items-center justify-center px-6 py-3 border border-border text-base font-medium rounded-md text-foreground bg-transparent hover:bg-muted transition-colors"
              >
                Quick Start
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}