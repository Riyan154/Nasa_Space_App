export const MISSION_PHOTOS={
 titan:{file:'titan-photo.jpg',title:'Kraken Mare coastal radar observations',credit:'NASA/JPL-Caltech/ASI/Cornell',kind:'Cassini RADAR observation · processed radar data',source:'https://science.nasa.gov/photojournal/plumbing-coastal-depths-in-titans-kraken-mare/'},
 moon:{file:'moon-photo.jpg',title:'Apollo 17 · Earthrise over the lunar horizon',credit:'NASA · Apollo 17 crew · AS17-152-23272',kind:'Astronaut photograph · lunar orbit, 1972',source:'https://www.nasa.gov/image-detail/amf-as17-152-23272/'},
 mars:{file:'mars-photo.jpg',title:'Jezero Crater delta panorama',credit:'NASA/JPL-Caltech/ASU/MSSS · PIA24921',kind:'Perseverance Mastcam-Z mosaic · enhanced color',source:'https://science.nasa.gov/photojournal/detailed-panorama-of-mars-jezero-crater-delta/'}
};
export function missionPhoto(state){return state.sent&&state.found.length===5?MISSION_PHOTOS[state.destination]||MISSION_PHOTOS.titan:null;}
export async function downloadMissionPhoto(state){
 const photo=missionPhoto(state);if(!photo)throw new Error('Complete all five discoveries and downlink first.');
 const url=new URL('./rewards/'+photo.file,import.meta.url);
 // A bundled original-observation image remains unaltered, with no invented endorsement badge.
 const response=await fetch(url);if(!response.ok)throw new Error('Mission photograph is unavailable. Please retry.');
 const blob=await response.blob();if(!blob.type.startsWith('image/'))throw new Error('Invalid photo response.');
 const object=URL.createObjectURL(blob),a=document.createElement('a');a.href=object;a.download='DEEP-FRONTIER-'+state.destination+'-NASA-'+photo.file;a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(object),30000);
}
