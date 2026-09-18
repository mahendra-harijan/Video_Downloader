// I'll just use standard HTML details/summary to avoid needing to install shadcn accordion which I forgot earlier
export function FAQ() {
  const faqs = [
    {
      question: "What can I download?",
      answer: "Only media from supported sources that you are authorized to download. Please respect copyright and terms of service."
    },
    {
      question: "Where is the file saved?",
      answer: "The browser saves it according to your normal download settings, usually in your 'Downloads' folder."
    },
    {
      question: "Why isn't a format available?",
      answer: "Some sources provide different formats depending on the media. We only show the formats that the source actually provides."
    },
    {
      question: "Why did my download fail?",
      answer: "The source may be unavailable, restricted, or the selected format may no longer be accessible. Please try again or select a different quality."
    }
  ];

  return (
    <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-muted-foreground md:text-lg">Everything you need to know about using CloudDrop.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group border rounded-lg bg-card shadow-sm open:shadow-md transition-all duration-200"
            >
              <summary className="flex cursor-pointer items-center justify-between p-6 font-medium marker:content-none">
                {faq.question}
                <span className="ml-6 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-muted/50 transition-transform duration-200 group-open:rotate-180">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-muted-foreground animate-in slide-in-from-top-1 fade-in duration-200">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
