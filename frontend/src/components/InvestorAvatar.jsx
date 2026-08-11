import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';

export const INVESTOR_PHOTOS = {
  buffett: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg/330px-Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg',
  graham: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Benjamin_Graham_%281894-1976%29_portrait_on_23_March_1950.jpg/330px-Benjamin_Graham_%281894-1976%29_portrait_on_23_March_1950.jpg',
  dalio: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Web_Summit_2018_-_Forum_-_Day_2%2C_November_7_HM1_7481_%2844858045925%29.jpg/330px-Web_Summit_2018_-_Forum_-_Day_2%2C_November_7_HM1_7481_%2844858045925%29.jpg',
  munger: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Charlie_Munger_%28cropped%29.jpg/330px-Charlie_Munger_%28cropped%29.jpg',
  bogle: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Photo_of_a_John_C._Bogle_By_Bill_Cramer.jpg/330px-Photo_of_a_John_C._Bogle_By_Bill_Cramer.jpg',
  soros: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/George_Soros%2C_Founder_and_Chairman_of_the_Open_Society_Foundations%2C_visits_the_EC_%283x4_cropped%29.jpg/330px-George_Soros%2C_Founder_and_Chairman_of_the_Open_Society_Foundations%2C_visits_the_EC_%283x4_cropped%29.jpg',
  ackman: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Valeant_Pharmaceuticals%27_Business_Model_%28headshot%29.jpg',
  lynch: 'https://images.squarespace-cdn.com/content/v1/677c19a116d70c308da04022/636f05ef-bef9-434e-befe-0c788f540407/Peter-Lynch-Headshot-Who-We-Are-Bio.jpg',
  fisher: '/investors/fisher.webp',
  greenblatt: '/investors/greenblatt.jpeg',
};

export default function InvestorAvatar({ strategy, sizePx = 64 }) {
  const [failed, setFailed] = useState(false);
  const src = INVESTOR_PHOTOS[strategy.id];
  const style = { width: sizePx, height: sizePx };

  if (!src || failed) {
    return (
      <div
        style={style}
        className={`rounded-full bg-gradient-to-br ${strategy.gradient} text-white flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-gray-800 shrink-0`}
      >
        <Briefcase size={sizePx * 0.375} />
      </div>
    );
  }

  return (
    <div style={style} className="rounded-full overflow-hidden shadow-lg ring-2 ring-white dark:ring-gray-800 shrink-0">
      <img
        src={src}
        alt={strategy.subtitle}
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
