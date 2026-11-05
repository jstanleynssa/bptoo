export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-5xl text-white mb-10 leading-tight" style={{ fontFamily: 'Peralta, serif' }}>About</h1>

      <div className="space-y-6 text-white/70 text-lg leading-relaxed">
        <p>
          Hey — I'm Jason. I'm an entrepreneur, builder, and creative based in North Carolina.
          I have bipolar 2, and I've spent a long time going from ashamed of that fact to genuinely
          proud of how it shapes the way I think and create.
        </p>
        <p>
          Bipolar 2 gets talked about mostly in terms of what it takes from people. I want to talk
          about what it gives: an ability to make connections others may miss, to get genuinely
          obsessed with ideas, to feel things deeply enough to make work that means something.
        </p>
        <p>
          This site is where I share the output. That means blog posts about ideas I'm chewing on,
          projects I'm building, and art I'm making. The through-line is authenticity — I'm not
          performing wellness or pretending I've figured everything out. I'm just making things and
          being honest about the process.
        </p>
      </div>

      <div className="border-t border-white/10 mt-12 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl text-white mb-4" style={{ fontFamily: 'Peralta, serif' }}>My grown up job</h2>
          <p className="text-white/70 leading-relaxed mb-3">
            I run the{' '}
            <a href="https://arpinstitute.com/" target="_blank" rel="noopener noreferrer"
              className="text-[#FACD40] hover:text-white transition-colors">
              Advanced Retirement Planning Institute
            </a>
            , a professional education platform for financial advisors.
          </p>
          <p className="text-white/70 leading-relaxed">
            I build courses and software, develop business strategy, manage operations,
            marketing, and everything in between.
          </p>
        </div>

        <div>
          <h2 className="text-2xl text-white mb-4" style={{ fontFamily: 'Peralta, serif' }}>bptoo</h2>
          <p className="text-white/70 leading-relaxed">
            The domain name is a bit of a wink. "BP too" — bipolar too, bipolar 2, and also just "me
            too" in a small way. A nod to everyone else who's living with this thing and figuring
            it out as they go.
          </p>
        </div>
      </div>
    </div>
  )
}
