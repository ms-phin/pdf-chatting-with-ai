import { Button } from "@/components/ui/button";
import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    name: "Store your PDF Documents",
    descripation:
      "Keep all your important PDF files securely stored and easily accessible anytime anywhere.",
    icon: GlobeIcon,
  },
  {
    name: "Blazing Fast Responses",
    descripation:
      "Experience lightning-fast to your queries, ensuring you get the information you need instantly.",
    icon: ZapIcon,
  },
  {
    name: "Chat Memorisation",
    descripation:
      "Our intelligent chatbot remembers previous interactions, providing a seamless and personalized expreience.",
    icon: BrainCogIcon,
  },
  {
    name: "Interactive PDF viewer ",
    descripation:
      "Engage with your PDFs like never befor using our intuitive and interactive viewer.",
    icon: EyeIcon,
  },
  {
    name: "Cloud Backup",
    descripation:
      "Rest assured knowing your document saftly backed up on the cloud. protected from loss or damage",
    icon: ServerCogIcon,
  },
  {
    name: "Responsive Across Devices",
    descripation:
      "Accessan and chat with PDFs seamlessly on any device, whether it's desktop, tablet, or smartphone ",
    icon: MonitorSmartphoneIcon,
  },
];
export default function Home() {
  return (
    <main className="flex-1 overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-white to-gray-700">
      <div className="bg-white py-20 sm:py-24 rounded-md drop-shadow-xl">
        <div
          className="flex flex-col justify-center items-center 
        mx-auto max-w-7xl px-6 lg:p-8"
        >
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2
              className="text-base font-semibold
             leading-7 text-gray-700 "
            >
              Your Interactive Documents Companion
            </h2>
            <p
              className="mt-2 text-3xl font-blod 
            tracking-tight text-gray-900 
            sm:text-6xl"
            >
              Transfrom your PDFs into Interacive Conversations
            </p>
            <p className="mt-6 text-lg landing-8 text-gray-400">
              Itroducing{" "}
              <span className="font-bold text-blue-400">Chat with PDF.</span>
              <br />
              <br />
              Upload your document, and our chatbot will answer question,
              summarize content, and all your Qs.Ideal for everyone,{" "}
              <span className="text-blue-400">Chat with PDF</span>
              {""}
              turns statics documents into{" "}
              <span className="font-bold">dynamic conversations</span> enhancing
              productivity to 10x fold effortlessly.
            </p>
            <Button asChild className="text-blue-600 mt-3 p-4">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
          <div className="relative overflow-hidden pt-10 ">
            <div className="mx-auto max-w-7xl px-6 lg:px-20">
              <Image
                alt="App screeshote"
                src="https://i.imgur.com/VciRSTI.jpeg"
                width={2432}
                height={1442}
                className="mb-[-0%] rounded-xl shadow-2xl ring-1
               ring-gray-900/10"
              />
            </div>
            <div aria-hidden="true" className="relative">
              <div className="absolute bottom-0 -inset-x-32 bg-gradient-to-t from-white/95 pt-[5%]"></div>
            </div>
          </div>
          <div
            className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24
          lg:px-8"
          >
            <dl
              className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10
            text-base leading-7  text-gray-600 sm:grid-col-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-y-16 "
            >
              {features.map((feature) => (
                <div key={feature.name} className=" relative flex w-full gap-3">
                  <dt className="inline font-semibold text-gray-900 ">
                    <feature.icon
                      aria-hidden="true"
                      className=" absolute left-1 top-1 h-5 w-5 text-blue-400"
                    />
                  </dt>
                  <dd className="ml-4">{feature.descripation}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
