import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook } from 'lucide-react';
import philmacLogo from '@/assets/philmac-logo.png';

export default function PublicFooter() {
  return (
    <footer className="bg-navy-dark text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={philmacLogo} alt="PHILMAC" className="w-10 h-10 object-contain rounded-full bg-white p-0.5" />
              <div>
                <span className="font-black text-white text-base">PHILMAC</span>
                <span className="text-brand font-black text-base"> Cebu</span>
                <p className="text-white/40 text-[10px] leading-none mt-0.5">Invest in Education, Build Traders Generation</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              A trading education and management academy focused on helping students build financial freedom through structured forex training and mentorship.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[['Home', '/'], ['About', '/about'], ['Programs', '/programs'], ['Free Workshop', '/free-workshop'], ['How It Works', '/how-it-works'], ['Register', '/register']].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-white/60 hover:text-brand transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Student Portal</h4>
            <ul className="space-y-2 text-sm">
              {[['Student Login', '/login'], ['My Dashboard', '/student/dashboard'], ['My Courses', '/student/courses'], ['Referral Network', '/student/referrals'], ['Certificates', '/student/certificates']].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-white/60 hover:text-brand transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span className="text-white/60">Upper Ground Floor, USPF Building, Salinas Drive, Lahug, Cebu City, Philippines 6000</span>
              </li>
              <li className="flex gap-2 items-center">
                <Phone className="w-4 h-4 text-brand" />
                <span className="text-white/60">0960 291 7937 / 0927 997 4868</span>
              </li>
              <li className="flex gap-2 items-center">
                <Mail className="w-4 h-4 text-brand" />
                <span className="text-white/60">philmac.ceb@gmail.com</span>
              </li>
              <li className="flex gap-2 items-center">
                <Facebook className="w-4 h-4 text-brand" />
                <span className="text-white/60">PHILMAC Cebu City</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>© 2026 PHILMAC Cebu Training Academy. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-brand transition-colors">Privacy Policy</span>
            <span className="cursor-pointer hover:text-brand transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
