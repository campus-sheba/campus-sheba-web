import Link from "next/link";
import { Users, Globe, GraduationCap, Zap, ShieldCheck, Heart } from "lucide-react";

const TEAM = [
  { name: "Md. Rafiqul Islam", role: "CEO & Co-Founder", dept: "CSE, Dhaka University", image: "👨‍💼" },
  { name: "Farida Khatun", role: "CTO & Co-Founder", dept: "EEE, BUET", image: "👩‍💻" },
  { name: "Tanvir Ahmed", role: "Head of Product", dept: "BBA, NSU", image: "👨‍🎨" },
  { name: "Sumaiya Akter", role: "Head of Marketing", dept: "MBA, DU", image: "👩‍💼" },
  { name: "Rezaul Karim", role: "Lead Engineer", dept: "CSE, CUET", image: "👨‍💻" },
  { name: "Nusrat Jahan", role: "Community Manager", dept: "Sociology, JU", image: "👩‍🏫" },
];

const SERVICES = [
  { icon: "🍔", label: "Food Delivery", desc: "Order from campus restaurants", href: "/delivery" },
  { icon: "🛍️", label: "Marketplace", desc: "Buy & sell on campus", href: "/marketplace" },
  { icon: "📚", label: "Books", desc: "Exchange academic books", href: "/books" },
  { icon: "🩸", label: "Blood Bank", desc: "Find blood donors", href: "/blood-bank" },
  { icon: "🎓", label: "Tuition", desc: "Find & become a tutor", href: "/tuition" },
  { icon: "💼", label: "Jobs", desc: "Part-time campus jobs", href: "/jobs" },
  { icon: "💚", label: "Donations", desc: "Support student campaigns", href: "/donation" },
  { icon: "📦", label: "Parcel", desc: "Send parcels on campus", href: "/parcel" },
  { icon: "🗑️", label: "Garbage", desc: "Schedule waste pickup", href: "/garbage" },
  { icon: "🔍", label: "Lost & Found", desc: "Recover lost belongings", href: "/lost-found" },
];

const STATS = [
  { value: "50,000+", label: "Active Students" },
  { value: "120+", label: "Campuses" },
  { value: "10", label: "Services" },
  { value: "98%", label: "Satisfaction Rate" },
];

const VALUES = [
  { icon: <Users className="w-6 h-6" />, title: "Community First", desc: "Every decision is made with students at the center. We build for and with the campus community." },
  { icon: <Globe className="w-6 h-6" />, title: "Nationwide Reach", desc: "From Dhaka to Chittagong, we're connecting students across every major university in Bangladesh." },
  { icon: <GraduationCap className="w-6 h-6" />, title: "Student-Led", desc: "Campus Sheba was founded by students and continues to be shaped by student feedback and innovation." },
  { icon: <Zap className="w-6 h-6" />, title: "Speed & Reliability", desc: "Fast, reliable services that students can count on for their everyday campus needs." },
  { icon: <ShieldCheck className="w-6 h-6" />, title: "Safe & Verified", desc: "All users and service providers are campus-verified, ensuring a trusted and safe environment." },
  { icon: <Heart className="w-6 h-6" />, title: "Social Impact", desc: "We support blood donation drives, charitable campaigns, and community initiatives that matter." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#E30A13] to-rose-700 text-white">
        <div className="cs-container py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
            🎓 Serving Students Since 2022
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">About Campus Sheba</h1>
          <p className="text-rose-100 text-lg max-w-2xl mx-auto">Bangladesh&rsquo;s first all-in-one campus super-app — connecting students with the services, opportunities, and community they need to thrive.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl px-8 py-4 text-center">
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-rose-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="cs-container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed">Campus Sheba was born from a simple idea: <strong>student life should be easier</strong>. We built a platform that brings all campus services — food, books, tutoring, jobs, blood donation, and more — into one unified experience. No more hunting across dozens of Facebook groups and Messenger threads.</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="bg-gray-50 py-16">
        <div className="cs-container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything Students Need</h2>
            <p className="text-gray-500">10 services, one platform, zero hassle</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {SERVICES.map((s) => (
              <Link key={s.label} href={s.href} className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-md hover:border-red-200 transition-all group">
                <span className="text-3xl mb-2 block">{s.icon}</span>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-[#E30A13]">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="cs-container py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Values</h2>
          <p className="text-gray-500">What drives everything we do</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E30A13] flex items-center justify-center mb-4">{v.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-gray-50 py-16">
        <div className="cs-container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Meet the Team</h2>
            <p className="text-gray-500">Students who built this for students</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-3xl flex-shrink-0">{member.image}</div>
                <div>
                  <p className="font-bold text-gray-900">{member.name}</p>
                  <p className="text-sm text-[#E30A13] font-medium">{member.role}</p>
                  <p className="text-xs text-gray-400">{member.dept}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="cs-container py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
          <div className="space-y-5 text-gray-600 text-base leading-relaxed">
            <p>It started in a dorm room at Dhaka University in 2022. Rafiqul was trying to find a used textbook for his algorithms class, but there was no organized place to look — just a chaotic Facebook group with thousands of posts. Farida, his classmate, had the same problem trying to find a blood donor for her mother. Both turned to scattered group chats and got frustrated.</p>
            <p>That weekend, they sat down and mapped out what a unified campus service platform could look like. Within three months, they had a prototype. Within six months, they had 500 users. Today, Campus Sheba serves over 50,000 students across more than 120 campuses in Bangladesh.</p>
            <p>We&rsquo;re still just getting started. Our vision is to build the infrastructure that makes student life in Bangladesh better in every measurable way — cheaper, faster, safer, and more connected.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#E30A13] to-rose-700 text-white py-16">
        <div className="cs-container text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-rose-100 mb-6">Join thousands of students already using Campus Sheba every day.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/?auth=signup" className="px-6 py-3 rounded-xl bg-white text-[#E30A13] font-semibold text-sm hover:bg-gray-100 transition-colors">Create Free Account</Link>
            <Link href="/delivery" className="px-6 py-3 rounded-xl border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors">Explore Services</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
