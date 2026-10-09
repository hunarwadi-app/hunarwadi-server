import { useNavigate } from "react-router-dom";

const UPDATED = "9 October 2026";
const CONTACT = "hunarwadi99@gmail.com";

function Doc({ title, sections }) {
  const navigate = useNavigate();
  return (
    <div className="screen">
      <div className="top-bar">
        <span className="back" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}>{"\u2190"}</span>
        <span style={{ fontWeight: 600 }}>{title}</span>
      </div>
      <p style={{ color: "var(--ink-soft)", fontSize: 12.5, marginBottom: 16 }}>Last updated: {UPDATED}</p>
      {sections.map(([h, paras]) => (
        <div key={h} style={{ marginBottom: 18 }}>
          <h2 className="display" style={{ fontSize: 17, marginBottom: 6 }}>{h}</h2>
          {paras.map((p, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 8 }}>{p}</p>
          ))}
        </div>
      ))}
      <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>Contact: {CONTACT}</p>
    </div>
  );
}

export function Terms() {
  return (
    <Doc
      title="Terms of Service"
      sections={[
        ["1. About HUNARWADI", [
          "HUNARWADI is a mobile and web app that connects local makers of handmade items with nearby buyers. It is operated by Vishnu, Chandausi, Uttar Pradesh, India ('we', 'us').",
          "By creating an account or using the app you agree to these Terms and to our Privacy Policy.",
        ]],
        ["2. Who can use it", [
          "You must be at least 18 years old. You must give accurate information and keep access to your email account. You are responsible for everything done through your account. One person, one account.",
        ]],
        ["3. What HUNARWADI is", [
          "HUNARWADI is only a platform for listing items, chatting and tracking order status. We do not handle payments, delivery or returns. Buyers and sellers agree the price and settle payment and handover directly between themselves.",
          "We are not a party to any sale and we do not guarantee the quality, safety, legality or authenticity of any item, or the behaviour of any user.",
        ]],
        ["4. Offers and orders", [
          "An offer in chat is only a negotiation message. The order status shown in the app (confirmed, preparing, ready, delivered) is a simple tracker that the buyer and seller update themselves. It is not proof of payment or delivery.",
          "Please agree on price, payment and handover clearly in chat, meet in a safe public place and check the item before you pay.",
        ]],
        ["5. Your content", [
          "You keep ownership of the photos, descriptions and other content you post. You allow us to store and display it inside the app so that the service can work. Post only items you are legally allowed to sell and photos you have the right to use.",
        ]],
        ["6. What is not allowed", [
          "Illegal, stolen, counterfeit or dangerous items (including weapons, drugs, alcohol, tobacco and legally protected animal products); adult or hateful content; harassment, threats or spam; fake reviews, fake offers or pretending to be someone else; collecting other users' data, or trying to break, overload or misuse the app.",
        ]],
        ["7. Reports, blocking and moderation", [
          "You can report a product and block a user from inside the app. We may hide or remove content and suspend or delete accounts that break these Terms or the law. A product that receives several reports may be hidden while we review it. To complain or appeal, email us.",
        ]],
        ["8. Reviews", [
          "Reviews must be honest and based on your real experience. We may remove reviews that look fake, abusive or unrelated.",
        ]],
        ["9. Deleting your account", [
          "You can delete your account at any time from Profile > Delete Account. More details are on the Delete Account page.",
        ]],
        ["10. No guarantees and limits of liability", [
          "The app is provided 'as is'. To the extent allowed by law, we are not responsible for losses arising from dealings between users, including quality, safety, delivery or payment disputes. Nothing in these Terms limits any right or liability that cannot be limited under applicable law.",
        ]],
        ["11. Changes", [
          "We may update these Terms. If we make an important change we will tell you in the app. Continuing to use the app after a change means you accept it.",
        ]],
        ["12. Governing law", [
          "These Terms are governed by the laws of India. Courts in Uttar Pradesh, India, have jurisdiction, subject to any consumer rights you have by law.",
        ]],
      ]}
    />
  );
}

export function Privacy() {
  return (
    <Doc
      title="Privacy Policy"
      sections={[
        ["1. Who we are", [
          "HUNARWADI is operated by Vishnu, Chandausi, Uttar Pradesh, India. For any privacy question write to " + CONTACT + ".",
        ]],
        ["2. Information we collect", [
          "Account: your email address, name and city.",
          "Location: if you allow it, your device's latitude and longitude, which is saved with your profile so we can show makers near you.",
          "Content you create: product listings and photos, chat messages and offers, orders, reviews, wishlist, reports you send, and the list of users you block.",
          "Technical: our hosting providers keep standard server logs (such as IP address and request time) for security and to keep the service running. The app does not show ads.",
        ]],
        ["3. How we use it", [
          "To log you in with an email code, show nearby products, let buyers and sellers chat, make offers and track orders, keep the community safe (reports, blocking, abuse prevention) and answer your requests. We do not sell your personal data.",
        ]],
        ["4. What other people can see", [
          "Your name, city, products, photos and the reviews you write are visible to other users, and product listings (with the seller's name and city) may be visible without logging in. Your email address is not shown to other users.",
          "Your exact coordinates are not shown to other users, but the app can show the approximate distance between you and a seller. Chats can be read only by the two people in them, except where we must review them after a report or to follow the law.",
        ]],
        ["5. Who processes data for us", [
          "We use these providers to run the service: Render (server hosting), MongoDB Atlas (database), Cloudinary (image hosting), Resend (sending login emails) and Vercel (website hosting). They handle data only to provide their service to us. We may share information if the law requires it.",
        ]],
        ["6. How long we keep it, and deleting it", [
          "We keep your data while your account is active. You can delete your account in the app (Profile > Delete Account) or by emailing us.",
          "Deletion removes your profile, products, chats and messages, wishlist, reviews, reports you made and your block list, and cancels active orders. Some limited records, such as order records without your name, security logs and backups, may remain for a short time or where the law requires.",
          "Product images stored with our image host may remain for a limited period after deletion. Email us if you want them removed sooner.",
        ]],
        ["7. Security", [
          "Data is sent over HTTPS, logins use one-time email codes with limits against abuse, and access is protected by tokens. No system is completely secure, so please keep your email account safe.",
        ]],
        ["8. Children", [
          "HUNARWADI is only for people aged 18 or older. If we learn that an account belongs to someone under 18, we will delete it.",
        ]],
        ["9. Your choices and rights", [
          "You can turn off location permission in your phone settings, ask us what data we hold about you, ask us to correct it, or ask us to delete it. As applicable under Indian law, including the Digital Personal Data Protection Act, 2023, you can also write to us with any complaint. We aim to reply within 7 days.",
        ]],
        ["10. Changes", [
          "If we change this policy we will update the date above and tell you in the app about important changes.",
        ]],
      ]}
    />
  );
}

export function DeleteAccountInfo() {
  return (
    <Doc
      title="Delete Your Account"
      sections={[
        ["Delete inside the app", [
          "Open the HUNARWADI app, go to Profile, tap Delete Account and confirm. Your account is deleted immediately.",
        ]],
        ["Cannot open the app?", [
          "Email " + CONTACT + " from the email address you registered with, with the subject 'Delete my account'. We will delete your account within 30 days.",
        ]],
        ["What is deleted", [
          "Your profile (email, name, city, location), your products and photo links, chats and messages, wishlist, reviews, reports you made and your block list. Active orders are cancelled.",
        ]],
        ["What may remain", [
          "Order records without your name, backups and security logs may be kept for a short time or as required by law. Product images on our image host may remain for a limited period; email us to have them removed sooner.",
        ]],
      ]}
    />
  );
}