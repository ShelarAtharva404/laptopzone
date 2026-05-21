import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
export default function NotFoundPage() {
  return (
    <div style={{ minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:40 }}>
      <div>
        <p style={{ fontFamily:'var(--font-display)',fontSize:'clamp(80px,15vw,160px)',fontWeight:800,color:'var(--border)',lineHeight:1 }}>404</p>
        <h1 style={{ fontFamily:'var(--font-display)',fontSize:28,fontWeight:800,marginBottom:10 }}>Page Not Found</h1>
        <p style={{ color:'var(--text-secondary)',fontSize:16,marginBottom:28 }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary" style={{ fontSize:15,padding:'14px 28px' }}>Go Home <ArrowRight size={18}/></Link>
      </div>
    </div>
  )
}
