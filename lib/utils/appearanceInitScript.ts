/**
 * Inline <head> script injected in app/layout.tsx. It runs BEFORE first paint and
 * sets BOTH `data-theme` and `data-season` synchronously so the CSS variable
 * palette is correct from frame 1 (kills the Minimal→Neo flash and the
 * wrong-season-then-flip flash).
 *
 * It is a self-contained string (no runtime imports), so its date-window logic
 * MUST mirror lib/utils/season.ts exactly. `season.test.ts` executes this string
 * against detectSeasonByDate() for sampled dates to catch any drift.
 */
export const APPEARANCE_INIT_SCRIPT = `(function(){try{
var el=document.documentElement;
var t=localStorage.getItem("tennis-theme");
el.setAttribute("data-theme",(t==="default"||t==="neo-brutalism")?t:"neo-brutalism");
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
