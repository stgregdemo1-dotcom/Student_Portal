export default function About() {
  return (
    <>
      {/* About Section - .about */}
      <section className="py-20 bg-[#f9f9f9]" id="About-us">
        <div className="container mx-auto px-4">
          
          {/* .about-content */}
          <div className="flex flex-col lg:flex-row items-center gap-[50px]">
            
            {/* .about-text */}
            <div className="flex-1">
              {/* .about-text h2 */}
              <h2 className="text-[2.5rem] font-bold text-[#2c3e50] mb-5 leading-tight">
                About Saint Gregory College
              </h2>
              
              {/* .about-text p */}
              <div className="space-y-[15px]">
                <p className="leading-[1.8] text-[#34495e]">
                  Founded in 2009, Saint Gregory College of Science and Technology
                  has been at the forefront of scientific education.
                </p>
                <p className="leading-[1.8] text-[#34495e]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc in arcu eu lorem dignissim efficitur eget ut ex. Nullam vitae diam eget nibh scelerisque mattis ut sit amet ipsum. Proin in lacinia leo. Donec tellus tellus, lobortis sodales urna a, sagittis finibus ipsum. Nam sapien leo, vestibulum id egestas vitae, tristique eu ante. Quisque sit amet enim ut purus posuere pellentesque a nec velit. Etiam a velit posuere, accumsan justo sollicitudin, sagittis sapien.

Phasellus non feugiat purus, vitae vehicula mauris. Nunc semper nulla vel auctor egestas. Proin tempus, justo non feugiat iaculis, purus leo maximus nisl, nec posuere magna tortor ut eros. Curabitur commodo ante ut rutrum pulvinar. Cras scelerisque dui mi, ac ultricies turpis pretium a. Sed gravida velit sed risus sagittis finibus. Maecenas et leo at erat auctor tempus eu a sapien. Integer ac auctor lacus, a feugiat velit.

Aenean scelerisque in orci eu accumsan. Mauris sed viverra justo. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce aliquet sollicitudin sem in blandit. Praesent velit orci, aliquet ut metus a, vestibulum sollicitudin metus. Aenean dignissim, diam in bibendum tempor, mauris mi vulputate massa, vel mattis nunc enim eget ipsum. Mauris tempor eu orci ac pharetra. Integer vitae placerat erat, in maximus sem. Sed ultricies, magna sit amet luctus congue, dui ipsum auctor mi, sit amet consequat tellus lorem sit amet quam. Donec vulputate velit id libero elementum posuere.

Quisque vitae turpis nec dolor scelerisque auctor quis in velit. Duis vulputate elementum viverra. Integer sit amet tortor pellentesque, lacinia velit nec, vestibulum eros. Suspendisse dapibus vel metus a varius. Nunc suscipit at est eu mattis. Suspendisse vehicula dapibus faucibus. Duis vitae mattis nunc, vulputate malesuada massa. Duis euismod mi libero, id sagittis neque sagittis eu. In tempus, mi rutrum tincidunt maximus, risus risus finibus mi, quis fermentum sem velit et nulla. Maecenas iaculis ligula sed magna ultricies, ut finibus neque suscipit. Nunc ut magna in arcu aliquet tristique et vitae dui. Pellentesque nibh lacus, congue at pretium nec, dignissim in lectus. Nam velit lorem, porta eu dapibus vitae, pellentesque sed nisl.
                </p>
              </div>


              <div className="mt-[50px] flex flex-wrap justify-around">
                
                {/* .stat-item */}
                <div className="p-5 text-center">
                  <div className="text-[3rem] font-bold text-[#FFD700]">5,000+</div>
                  <div className="text-[1.1rem] text-[#2c3e50]">Students Graduated</div>
                </div>

                <div className="p-5 text-center">
                  <div className="text-[3rem] font-bold text-[#FFD700]">20+</div>
                  <div className="text-[1.1rem] text-[#2c3e50]">Faculty Members</div>
                </div>

                <div className="p-5 text-center">
                  <div className="text-[3rem] font-bold text-[#FFD700]">17</div>
                  <div className="text-[1.1rem] text-[#2c3e50]">Years of Excellence</div>
                </div>
                
              </div>
            </div>

                          {/* Note: I've added a placeholder for the .about-image class 
                found in your CSS but missing in your original JSX */}
            <div className="flex-1 rounded-[10px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] hidden lg:block">
               <img src="/api/placeholder/600/400" alt="College Campus" className="w-full h-auto block" />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}