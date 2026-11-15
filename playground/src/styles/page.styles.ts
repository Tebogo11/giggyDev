import styled from 'styled-components';

// Page styles stay in the playground and are excluded from the library build.
export const Page = styled.div<{ $dark: boolean }>`
  --lime: #a3f000;
  --accent: ${({ $dark }) => $dark ? '#a3f000' : '#477300'};
  --background: ${({ $dark }) => $dark ? '#151719' : '#ffffff'};
  --text: ${({ $dark }) => $dark ? '#f5f7f8' : '#151719'};
  --muted: ${({ $dark }) => $dark ? '#a4abb2' : '#596169'};
  --subtle: ${({ $dark }) => $dark ? '#818a92' : '#626c74'};
  --border: ${({ $dark }) => $dark ? '#343a40' : '#dce1e4'};
  --panel: ${({ $dark }) => $dark ? '#1c1f21' : '#f5f7f8'};
  background: var(--background);
  color: var(--text);
  min-height: 100vh;
  color-scheme: ${({ $dark }) => $dark ? 'dark' : 'light'};
  .header-actions { display: flex; align-items: center; gap: 24px; }
  .theme-toggle { color: var(--text); background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; font-size: 11px; }


* {
  box-sizing:border-box
}
a {
  color:inherit;
  text-decoration:none
}
button {
  font:inherit;
  cursor:pointer
}
a:focus-visible,button:focus-visible {
  outline:2px solid var(--lime);
  outline-offset:5px
}
.top {
  height:90px;
  padding:0 7%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  border-bottom:1px solid var(--border)
}
.top nav {
  flex-wrap:wrap;
  max-width:100%;
  display:flex;
  gap:30px;
  font-size:12px;
  color:var(--muted)
}
.top nav a:hover {
  color:var(--accent)
}
.logo {
  font-size:25px;
  font-weight:800;
  letter-spacing:-1.5px
}
.logo span {
  color:var(--accent)
}
main {
  max-width:1440px;
  margin:auto
}
.hero {
  position:relative;
  padding:100px 9% 30px;
  overflow:hidden
}
.label {
  font:10px Sora,system-ui;
  letter-spacing:2px;
  color:var(--muted);
  display:flex;
  align-items:center;
  gap:10px
}
.label>span,.live {
  width:6px;
  height:6px;
  border-radius:50%;
  background:var(--lime);
  display:inline-block
}
.hero h1 {
  font-size:clamp(54px,6.7vw,96px);
  line-height:1.12;
  letter-spacing:-6px;
  margin:35px 0 28px;
  font-weight:600
}
.hero em {
  color:var(--accent);
  font-style:normal
}
.intro {
  font-size:16px;
  line-height:1.9;
  max-width:540px;
  color:var(--muted)
}
.actions {
  display:flex;
  align-items:center;
  gap:30px;
  margin-top:35px;
  font-size:12px
}
.primary {
  background:var(--lime);
  color:#151719;
  padding:18px 22px;
  border-radius:6px;
  font-weight:600
}
.secondary {
  border-bottom:1px solid #a4abb2;
  padding:8px 0
}
.hero-footer {
  display:flex;
  justify-content:space-between;
  margin-top:90px;
  border-top:1px solid var(--border);
  padding-top:24px;
  color:var(--subtle);
  font-size:9px;
  letter-spacing:1.5px
}
.triangles {
  position:absolute;
  right:-15px;
  top:35px;
  display:grid;
  grid-template-columns:repeat(4,85px);
  gap:14px;
  transform:rotate(-12deg);
  opacity:.6;
  pointer-events:none
}
.triangles i {
  width:85px;
  height:90px;
  clip-path:polygon(50% 0,100% 100%,0 100%);
  background:#343c2d
}
.triangles i:nth-child(3n) {
  background:var(--lime)
}
.triangles i:nth-child(2n) {
  opacity:.2
}
.strip {
  margin-top:40px;
  padding:28px 9%;
  background:var(--panel);
  display:flex;
  justify-content:space-between;
  color:var(--muted);
  font-size:10px;
  letter-spacing:2px
}
.feature {
  padding:90px 9%;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:80px;
  border-bottom:1px solid var(--border)
}
.feature h2 {
  font-size:36px;
  letter-spacing:-1.6px;
  margin:22px 0
}
.feature h2 span {
  color:var(--accent)
}
.feature p,.getting-started p {
  font-size:14px;
  line-height:1.9;
  color:var(--muted)
}
.feature small {
  font-size:11px;
  line-height:1.8;
  color:var(--subtle);
  display:block;
  max-width:400px
}
.test-card {
  background:var(--panel);
  border:1px solid var(--border);
  border-radius:14px;
  overflow:hidden
}
.card-top {
  display:flex;
  align-items:center;
  gap:9px;
  padding:20px;
  color:var(--muted);
  font-size:9px;
  letter-spacing:1.2px
}
.card-top>span:last-child {
  margin-left:auto;
  color:var(--subtle)
}
.test-card button {
  display:block;
  width:100%;
  text-align:left;
  border:0;
  border-top:1px solid var(--border);
  background:none;
  color:var(--text);
  padding:22px
}
.test-card button:hover {
  background:#a3f00008
}
.test-card b {
  display:block;
  font-size:12px;
  font-weight:500
}
.test-card button>span {
  display:block;
  color:var(--subtle);
  font-size:10px;
  margin-top:9px
}
.result {
  margin:30px 9% 0;
  border-left:2px solid var(--lime);
  padding:14px 20px;
  background:var(--panel);
  font-size:12px;
  line-height:1.8;
  color:var(--muted)
}
.result>span {
  display:block;
  color:var(--accent);
  font-size:9px;
  letter-spacing:2px;
  margin-bottom:6px
}
.getting-started {
  padding:90px 9%;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:70px
}
.getting-started h2 {
  font-size:42px;
  line-height:1.25;
  letter-spacing:-2px
}
.note {
  font-size:11px!important
}
.code {
  background:var(--panel);
  border:1px solid var(--border);
  border-radius:14px;
  padding:25px;
  align-self:center;
  overflow:auto
}
.code>span {
  font-size:9px;
  color:var(--subtle);
  letter-spacing:2px
}
.code pre {
  font:12px/1.9 monospace;
  color:var(--accent);
  margin:25px 0
}
.code small {
  color:var(--subtle);
  font-size:10px;
  line-height:1.8
}
.page-footer {
  padding:40px 9% 60px;
  border-top:1px solid var(--border);
  display:flex;
  align-items:center;
  justify-content:space-between
}
.page-footer>span {
  font-size:9px;
  color:var(--subtle);
  letter-spacing:1px
}
@media(max-width:800px) {
  .top {
  padding:20px 6%;
  height:auto;
  gap:20px;
  flex-direction:column-reverse;
  align-items:flex-start
}
.top nav {
  gap:20px;
  font-size:10px
}
.hero {
  padding:70px 6% 25px
}
.hero h1 {
  letter-spacing:-3px
}
.triangles {
  right:-150px;
  opacity:.25
}
.hero-footer {
  gap:20px;
  margin-top:60px;
  line-height:1.8
}
.strip {
  padding:20px 6%;
  gap:20px;
  font-size:8px;
  letter-spacing:1px
}
.feature,.getting-started {
  grid-template-columns:1fr;
  gap:30px;
  padding:60px 6%
}
.feature h2 {
  font-size:32px
}
.page-footer {
  gap:25px;
  align-items:flex-start;
  flex-direction:column
}
.result {
  margin:30px 6%
}

}
@media(prefers-reduced-motion:reduce) {
  
}


`;
