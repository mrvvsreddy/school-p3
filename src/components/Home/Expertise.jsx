import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiMinus } from 'react-icons/hi';

const Expertise = () => {
    const categories = [
        { id: '01.', title: 'Arts and Humanities', desc: 'Explore the depths of human culture and expression.' },
        { id: '02.', title: 'Social Sciences', desc: 'Designed to help students develop skills in research and analysis.' },
        { id: '03.', title: 'Business and Management', desc: 'Learn the strategies that drive modern global economies.' },
        { id: '04.', title: 'Science and Technology', desc: 'Pushing the boundaries of innovation and discovery.' },
        { id: '05.', title: 'Engineering and Technology', desc: 'Building the future with cutting-edge engineering solutions.' },
    ];

    const [activeId, setActiveId] = useState('02.');

    return (
        <section className="py-24 bg-edu-gray">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <span className="text-edu-red font-bold uppercase tracking-widest text-xs">Our Focus</span>
                    <h2 className="text-4xl lg:text-5xl font-serif font-bold text-edu-dark mt-4">
                        Academies <span className="underline decoration-edu-red/30 underline-offset-8">expertise</span>
                    </h2>
                </div>

                <div className="space-y-2">
                    {categories.map((item) => (
                        <div
                            key={item.id}
                            className={`border-b border-gray-200 transition-colors duration-300 ${activeId === item.id ? 'bg-edu-red text-white' : 'bg-white hover:bg-gray-50'}`}
                            onMouseEnter={() => setActiveId(item.id)}
                        >
                            <div className="flex items-center justify-between p-8 cursor-pointer">
                                <div className="flex items-center gap-8">
                                    <span className={`text-4xl font-serif font-bold opacity-30 ${activeId === item.id ? 'text-white' : 'text-gray-300'}`}>{item.id}</span>
                                    <h3 className="text-xl lg:text-2xl font-bold font-serif">{item.title}</h3>
                                </div>
                                <div className="hidden md:block">
                                    {activeId === item.id ? <HiMinus size={24} /> : <HiPlus size={24} />}
                                </div>
                            </div>
                            <AnimatePresence>
                                {activeId === item.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="px-8 pb-8 pl-[6.5rem] text-sm lg:text-base opacity-80 max-w-2xl">
                                            {item.desc}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Logos underneath */}
                <div className="mt-20 flex flex-wrap justify-between items-center gap-8 grayscale opacity-50">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Partner 1" className="h-8 md:h-10" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Partner 2" className="h-8 md:h-10" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" alt="Partner 3" className="h-8 md:h-10" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Partner 4" className="h-8 md:h-10" />
                </div>

            </div>
        </section>
    );
};

export default Expertise;
