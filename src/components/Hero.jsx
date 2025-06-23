import { useEffect, useRef, useState } from 'react'
import Button from './Button';
import { TiLocationArrow } from 'react-icons/ti';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';


gsap.registerPlugin(ScrollTrigger);

const useVideoPool = (totalVideos, getVideoSrc) => {
  const [videoPool, setVideoPool] = useState({});
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    const loadVideos = async () => {
      const pool = {};
      
      for (let i = 1; i <= totalVideos; i++) {
        try {
          const response = await fetch(getVideoSrc(i));
          const blob = await response.blob();
          const videoUrl = URL.createObjectURL(blob);
          pool[i] = videoUrl;
          setLoadedCount(prev => prev + 1);
        } catch (error) {
          console.error(`Failed to load video ${i}:`, error);
        }
      }
      
      setVideoPool(pool);
    };

    loadVideos();

    // Cleanup function to revoke object URLs
    return () => {
      Object.values(videoPool).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  return { videoPool, loadedCount };
};


const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const currentVideoRef = useRef(null);
  
  const totalVideos = 4;
  const nextVdoRef = useRef(null);
  
  const getVideoSrc = (index) => {
    return `/videos/hero-${index}.mp4`;
  }
  
  const { videoPool, loadedCount } = useVideoPool(totalVideos, getVideoSrc);

  // Update your getVideoSrc function
  const getVideoSource = (index) => {
    return videoPool[index];
  };

  const upcomingVideoIndex = (currentIndex % totalVideos) + 1;

  const handleMiniClick = () => {
    setHasClicked(true);
    setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);
  };

  useGSAP(() => {
      if(hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });

        gsap.to('#next-video', {
          transformOrigin: 'center center',
          width: '100%',
          height: '100%',
          duration: 1,
          ease: 'power1.inOut',
          onStart: () => nextVdoRef.current.play(),
          onComplete: () => {
             currentVideoRef.current.src = getVideoSource(currentIndex)+"#t="+parseFloat(nextVdoRef.current.currentTime + 0.038);
          }
        })

        gsap.from('#current-video',{
          transformOrigin: 'center center',
          scale:0,
          duration: 1.5,
          ease: 'power1.inOut',
        })
      }

  },{
    dependencies: [currentIndex],
    revertOnUpdate: true,
  })

  useGSAP(() => {
    gsap.set('#video-frame', {
      clipPath: 'polygon(14% 0, 72% 0, 88% 90%, 0 95%)',
    })

    gsap.from('#video-frame', {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      ease: 'power1.inOut',
      scrollTrigger: {
        trigger: '#video-frame',
        start: 'center center',
        end:'bottom center',
        scrub:'true'
      }
    })
  })

  useEffect(() => {
    if(loadedCount >= totalVideos) {
      setIsLoading(false);
    }
  }, [loadedCount])

  return (
    <div className='relative h-dvh w-screen overflow-x-hidden'>
        {isLoading && (
          <div className='flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-violet-50'>
            <div className='three-body'>
              <div className='three-body__dot'/>
              <div className='three-body__dot'/>
              <div className='three-body__dot'/>
            </div>
          </div>  
        )}
        <div id="video-frame" className='relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75'>
            <div>
                <div className='mask-clip-path absolute-center z-50 size-64 cursor-pointer overflow-hidden rounded-lg'>
                    <div onClick={handleMiniClick} className='origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100'>
                        <video 
                            src={getVideoSource(upcomingVideoIndex)}
                            loop
                            muted
                            id="current-video"
                            className='size-64 origin-center scale-150 object-cover object-center'
                        />
                    </div>
                </div>
                <video 
                    ref={nextVdoRef}
                    src={getVideoSource(currentIndex)}
                    loop
                    muted
                    id="next-video"
                    className='absolute-center invisible z-20 size-64 object-cover object-center'
                ></video>
                <video src={getVideoSource(1)} 
                    autoPlay
                    ref={currentVideoRef}
                    loop 
                    muted  
                    className='absolute left-0 top-0 size-full object-cover object-center'
                ></video>
            </div>
            <h1 className='special-font hero-heading absolute bottom-5 right-5 z-40 text-blue-75'>
              G<b>a</b>ming
            </h1>
            <div className='absolute left-0 top-0 z-40 size-full'>
              <div className='mt-24 px-5 sm:px-10'>
                  <h1 className='special-font hero-heading text-blue-100'>redefi<b>n</b>e</h1>
                  <p className='mb-5 max-w-64 font-robert-regular text-blue-100'>Enter the Metagame layer <br /> Unleash the Play Economy</p>  
                  <Button id="watch-trailer" title="Watch Trailer" leftIcon={<TiLocationArrow/>} containerClass="bg-yellow-300 flex-center gap-1" />            
              </div>
            </div>
        </div>
        <h1 className='special-font hero-heading absolute bottom-5 right-5 text-black'>
              G<b>a</b>ming
        </h1>
    </div>
  )
}

export default Hero