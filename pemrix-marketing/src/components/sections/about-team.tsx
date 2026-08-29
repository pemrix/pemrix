import Image from "next/image";

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const teamMembers = [
  {
    name: "Maya Okonkwo",
    role: "CEO & Co-founder",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop&crop=faces&q=80",
  },
  {
    name: "Daniel Reyes",
    role: "CTO & Co-founder",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop&crop=faces&q=80",
  },
  {
    name: "Priya Sharma",
    role: "Head of Platform",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=800&fit=crop&crop=faces&q=80",
  },
  {
    name: "James Whitfield",
    role: "Staff Engineer",
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&h=800&fit=crop&crop=faces&q=80",
  },
  {
    name: "Aisha Patel",
    role: "Developer Advocate",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=800&fit=crop&crop=faces&q=80",
  },
  {
    name: "Lucas Bergström",
    role: "Product Designer",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop&crop=faces&q=80",
  },
  {
    name: "Elena Vasquez",
    role: "Head of Infrastructure",
    image: "https://images.unsplash.com/photo-1615109398623-88346a601842?w=600&h=800&fit=crop&crop=faces&q=80",
  },
];

export default function AboutTeam() {
  return (
    <section className="section-padding container max-w-screen-xl">
      <h2 className="text-4xxl leading-tight tracking-tight md:text-5xl">Meet the Relay team</h2>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg leading-snug">
        A remote-first group of platform engineers, designers, and developer advocates across 9 countries — building
        CI/CD that keeps up with how modern teams ship.
      </p>

      <Carousel
        className="mt-10"
        opts={{
          align: "start",
          loop: false,
        }}
      >
        <CarouselContent className="cursor-grab snap-x snap-mandatory">
          {teamMembers.map((member, index) => (
            <CarouselItem key={index} className="min-w-[289px] basis-1/4 snap-start">
              <Image
                src={member.image}
                alt={member.name}
                width={289}
                height={358}
                className="aspect-[289/358] w-full rounded-xl object-cover"
              />
              <h3 className="text-accent-foreground mt-4 text-2xl font-bold">{member.name}</h3>
              <p className="text-muted-foreground">{member.role}</p>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
