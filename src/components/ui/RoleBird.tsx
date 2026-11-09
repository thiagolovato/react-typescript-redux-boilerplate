import birds from '../../assets/mentor-mentee-birds-640.jpg';

type Role = 'MENTOR' | 'MENTEE';
type RoleBirdSize = 'sm' | 'md';

interface RoleBirdProps {
  role: Role;
  size?: RoleBirdSize;
  className?: string;
}

// Crops one bird out of the round logo: the larger blue bird is the mentor, the smaller green one the mentee.
// Offsets are the bird's bounding square in the 1024px source, scaled to the box size.
const cropClasses: Record<RoleBirdSize, Record<Role, string>> = {
  sm: {
    MENTOR: 'w-[49px] max-w-none -left-[4px] -top-[11px]',
    MENTEE: 'w-[65px] max-w-none -left-[33px] -top-[21px]',
  },
  md: {
    MENTOR: 'w-[82px] max-w-none -left-[6px] -top-[18px]',
    MENTEE: 'w-[108px] max-w-none -left-[55px] -top-[35px]',
  },
};

const boxClasses: Record<RoleBirdSize, string> = {
  sm: 'size-6',
  md: 'size-10',
};

/** Decorative. The surrounding text names the role. */
export function RoleBird({ role, size = 'md', className = '' }: RoleBirdProps) {
  return (
    <span aria-hidden="true" className={`relative block shrink-0 overflow-hidden ${boxClasses[size]} ${className}`}>
      <img src={birds} alt="" className={`absolute mix-blend-multiply ${cropClasses[size][role]}`} />
    </span>
  );
}
