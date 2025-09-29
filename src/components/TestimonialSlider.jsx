import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
    {
        quote: "The AI interview on Crisp was incredibly insightful. It asked relevant, challenging questions and gave me instant, objective feedback. It's the future of technical screening.",
        name: "Sarah L.",
        title: "Senior Full Stack Developer"
    },
    {
        quote: "As a hiring manager, Crisp has saved us countless hours. The AI summary is spot-on, and the dashboard makes it easy to track and compare candidates. A total game-changer.",
        name: "Michael B.",
        title: "Engineering Manager, TechCorp"
    },
    {
        quote: "I was nervous at first, but the timed format and clear questions made the process straightforward. It was a fair and modern way to showcase my skills without bias.",
        name: "David C.",
        title: "Mid-Level React Developer"
    },
    {
        quote: "The ability to just upload my resume and get started in minutes was amazing. The Crisp platform is smooth, intuitive, and respects the candidate's time.",
        name: "Jessica P.",
        title: "Node.js Specialist"
    }
];

const TestimonialSlider = () => {
    // Initialize Embla Carousel with the autoplay plugin
    const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [
        Autoplay({ delay: 5000, stopOnInteraction: false })
    ]);

    return (
        <div className="w-full max-w-6xl mx-auto py-12">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">Why Professionals Choose Crisp</h2>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {testimonials.map((testimonial, index) => (
                        <div className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-4" key={index}>
                            <div className="h-full bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col">
                                <p className="text-slate-600 mb-6 flex-grow">"{testimonial.quote}"</p>
                                <div className="flex items-center">
                                    <Avatar>
                                        <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${testimonial.name}`} alt={testimonial.name} />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4">
                                        <p className="font-semibold text-slate-900">{testimonial.name}</p>
                                        <p className="text-sm text-slate-500">{testimonial.title}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestimonialSlider;