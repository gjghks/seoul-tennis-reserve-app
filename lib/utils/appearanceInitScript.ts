/**
 * Inline <head> script injected in app/layout.tsx. Runs BEFORE first paint and
 * sets, synchronously, all THREE appearance axes so the CSS-variable palette is
 * correct from frame 1 (no flash):
 *   - data-theme  (neo-brutalism | default)            from localStorage 'tennis-theme'
 *   - .dark class + data-mode (light | dark | system)  from localStorage 'tennis-mode' (+ prefers-color-scheme)
 *   - data-season (6 seasons)                          from localStorage 'tennis-season-manual' or the date
 *
 * Self-contained string (no runtime imports), so its logic MUST mirror
 * lib/utils/season.ts and lib/utils/appearanceMode.ts. season.test.ts executes
 * this string and asserts agreement to catch drift.
 */
export const APPEARANCE_INIT_SCRIPT = `(function(){try{
var el=document.documentElement;
var t=localStorage.getItem("tennis-theme");
el.setAttribute("data-theme",(t==="default"||t==="neo-brutalism")?t:"neo-brutalism");
var mode=localStorage.getItem("tennis-mode");
if(mode!=="light"&&mode!=="dark"&&mode!=="system")mode="system";
var dark=mode==="dark"||(mode==="system"&&typeof window.matchMedia==="function"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
el.classList[dark?"add":"remove"]("dark");
el.setAttribute("data-mode",mode);
localStorage.removeItem("tennis-season");
var s=localStorage.getItem("tennis-season-manual");
var valid=["default","cherry-blossom","tennis-spring","tennis-summer","tennis-autumn","tennis-winter"];
var season;
if(s&&valid.indexOf(s)>=0){season=s;}else{
var now=new Date(),m=now.getMonth()+1,d=now.getDate();
season=((m===3&&d>=15)||(m===4&&d<=20))?"cherry-blossom"
:((m===4&&d>=21)||m===5||(m===6&&d<=15))?"tennis-spring"
:((m===6&&d>=16)||m===7||m===8)?"tennis-summer"
:(m===9||m===10)?"tennis-autumn"
:(m>=11||m<=2||(m===3&&d<=14))?"tennis-winter"
:"default";}
el.setAttribute("data-season",season);
}catch(e){}})()`;
