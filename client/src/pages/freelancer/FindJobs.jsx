import React, {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {  
  Link,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  Search,
  Sparkles,
  Briefcase,
  Users,
} from "lucide-react";

import GigFilters from "../../components/gigs/GigFilters";

import {
  getAllGigs,
  clearGigError,
} from "../../store/slices/gigSlice";

function SkeletonCard() {
  return (
    <div
      className="
    rounded-[30px]
    border border-white/10
    bg-white/[0.03]
    backdrop-blur-3xl
    p-6
    space-y-4
    animate-pulse
  "
    >
      <div className="h-6 w-1/2 bg-white/10 rounded-2xl" />
      <div className="h-3 w-full bg-white/5 rounded-2xl" />
      <div className="h-3 w-5/6 bg-white/5 rounded-2xl" />

      <div className="flex items-center gap-3 mt-4">
        <div className="w-8 h-8 rounded-full bg-white/5" />
        <div className="h-4 w-24 bg-white/5 rounded-2xl" />
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="h-9 w-24 bg-white/5 rounded-full" />
        <div className="h-9 w-28 bg-white/5 rounded-full" />
      </div>
    </div>
  );
}

function GigCard({ gig }) {
  const matchScore =
    gig.matchScore ?? 0;
  const user = useSelector((state) => state.auth.user);
  const userSkills = user?.skills || [];
  const gigSkills = gig.skills || [];

  const matched = userSkills.filter((skill) => {
    const sName = typeof skill === 'string' ? skill : skill.name || '';
    return gigSkills.some(
      (g) => g.toLowerCase().trim() === sName.toLowerCase().trim()
    );
  });

  return (
    <div className="rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-8 h-full flex flex-col">
      {/* Top section with match score */}
      <div className="flex items-center justify-between">
        <Link to={`/gig/${gig._id}`} className="flex items-center gap-3">
          <div className="relative">
            <img
              src={gig.client?.avatar ? (gig.client.avatar.startsWith('http') ? gig.client.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${gig.client.avatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.client?.fullName || 'Client')}&background=1e293b&color=cbd5e1`}
              alt={gig.client?.fullName || "Client"}
              className="h-12 w-12 rounded-2xl object-cover border border-white/10"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.client?.fullName || 'Client')}&background=1e293b&color=cbd5e1`; }}
            />
            {/* Online status dot */}
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold line-clamp-2" title={gig.title}>{gig.title}</h3>

            <p className="text-slate-400 mt-1 text-sm truncate" title={gig.client?.fullName || "Verified Client"}>
              {gig.client?.fullName || "Verified Client"}
            </p>
          </div>
        </Link>

        {/* Match badge only for matched gigs */}
        {matchScore > 0 && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-sm ${
              matchScore >= 70
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            }`}
          >
            <Sparkles size={14} />
            <span>{matchScore}% Match</span>
          </div>
        )}
      </div>

      {/* Skills section with proper alignment */}
      <div className="mt-5 min-h-[90px]">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">
          Skills Required
        </h4>

        <div className="flex flex-wrap gap-2">
          {gigSkills.map((skill, i) => {
            const matchedSkill = matched.find((s) => {
              const sName = typeof s === 'string' ? s : s.name || '';
              return sName.toLowerCase().trim() === skill.toLowerCase().trim();
            });

            return (
              <span
                key={i}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${
                  matchedSkill
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    : "bg-white/5 text-slate-400 border-white/10"
                } text-sm`}
              >
                {matchedSkill && <Sparkles size={12} />}
                <span>{skill}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Budget and duration */}
      <div className="mt-6 flex justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Budget</p>
          <p className="text-xl font-bold mt-1">
            ${gig.budget || 0}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Duration
          </p>
          <p className="text-xl font-bold mt-1">
            {gig.deliveryTime ? `${gig.deliveryTime} days` : "Negotiable"}
          </p>
        </div>
      </div>

      {/* Apply and Details buttons */}
      <div className="mt-auto pt-6 flex gap-3">
        <Link
          to={`/gig/${gig._id}`}
          className="flex-1 bg-cyan-500 text-cyan-950 font-semibold py-3 rounded-2xl hover:bg-cyan-400 transition text-center"
        >
          View Details
        </Link>
        <Link
          to={`/proposal/create/${gig._id}`}
          className="flex-1 bg-white text-slate-900 font-semibold py-3 rounded-2xl hover:bg-slate-100 transition text-center"
        >
          Apply Now
        </Link>
      </div>
    </div>
  );
}


export default function FindJobs() {
  const dispatch = useDispatch();

  const {
    gigs = [],
    loading,
    error,
  } = useSelector(
    (state) => state.gig
  );

  const { user } =
    useSelector(
      (state) => state.auth
    );

  const [filters, setFilters] =
    useState({
      search: "",
      category: "",
      sortBy: "",
    });

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      category: "",
      sortBy: "",
    });
  };

  useEffect(() => {
    const timer =
      setTimeout(() => {
        dispatch(
          getAllGigs(filters)
        );
      }, 300);

    return () => {
      clearTimeout(timer);
      dispatch(
        clearGigError()
      );
    };
  }, [
    dispatch,
    filters,
  ]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const processedGigs = gigs.map((gig) => {
      const userSkills = user?.skills || [];
      const gigSkills = gig.skills || [];

      const matched = userSkills.filter((skill) => {
        const sName = typeof skill === 'string' ? skill : skill.name || '';
        return gigSkills.some(
          (g) => g.toLowerCase().trim() === sName.toLowerCase().trim()
        );
      });

      const matchScore = gigSkills.length > 0
        ? Math.round((matched.length / gigSkills.length) * 100)
        : 0;

      return {
        ...gig,
        matchScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="space-y-8 text-white">

      {
  processedGigs.some(
    (g) =>
      g.matchScore >= 70
  ) && (
    <div
      className="
      rounded-[30px]
      border
      border-emerald-500/20
      bg-emerald-500/10
      p-5
      "
    >
      <div className="flex items-center gap-3">
        <Sparkles className="text-emerald-400" />

        <div>
          <h3 className="font-semibold text-emerald-300">
            AI Recommendation
          </h3>

          <p className="text-sm text-slate-300 mt-1">
            You have{" "}
            {
              processedGigs.filter(
                (g) =>
                  g.matchScore >=
                  70
              ).length
            }{" "}
            highly matched jobs.
          </p>
        </div>
      </div>
    </div>
  )
}
      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <div
        className="
      relative
      overflow-hidden
      rounded-[36px]
      border border-white/10
      bg-white/[0.04]
      backdrop-blur-3xl
      p-8 md:p-10
      "
      >
        <div className="absolute w-[300px] md:w-[380px] h-[300px] md:h-[380px] rounded-full bg-blue-600/20 blur-[120px] -top-20 -right-20" />
        <div className="absolute w-[220px] h-[220px] rounded-full bg-cyan-500/10 blur-[110px] bottom-0 left-0" />

        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Discover Amazing Projects
          </h1>

          <p className="text-slate-400 mt-4 max-w-2xl text-sm md:text-base">
            Browse thousands of opportunities powered by AI recommendations and hyperlocal
            matching.
          </p>

          <div className="flex flex-wrap gap-3 md:gap-4 mt-8">
            <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl bg-white/5 border border-white/10 text-sm md:text-base">
              <Briefcase size={15} className="text-slate-400" />
              12K+ Jobs
            </div>

            <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl bg-white/5 border border-white/10 text-sm md:text-base">
              <Users size={15} className="text-slate-400" />
              4K+ Clients
            </div>

            <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm md:text-base font-medium">
              <Sparkles size={15} />
              AI Matching Enabled
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════ FILTERS ══════════════════════════ */}
      <div
        className="
  rounded-[36px]
  border border-white/10
  bg-white/[0.04]
  backdrop-blur-3xl
  p-6
  "
      >
        <GigFilters filters={filters} onChange={handleChange} onReset={handleReset} />
      </div>


{processedGigs.some(
(g)=>
g.matchScore >=70
) && (

<div
className="
rounded-[30px]
border
border-emerald-500/20
bg-emerald-500/10
p-5
"
>
<div
className="
flex
items-center
gap-3
"
>
<Sparkles
className="
text-emerald-400
"
/>

<div>
<h3
className="
font-semibold
text-emerald-300
"
>
AI Recommendation
</h3>

<p
className="
text-sm
text-slate-300
mt-1
"
>
You have
{
processedGigs.filter(
g=>
g.matchScore >=70
).length
}
 highly matched jobs.
</p>
</div>
</div>
</div>
)}


      {/* ══════════════════════════ JOBS ══════════════════════════ */}
     {loading && (
  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
    {Array.from({
      length: 6,
    }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)}

      {!loading && gigs.length === 0 && (
        <div
          className="
  rounded-[36px]
  border border-white/10
  bg-white/[0.04]
  backdrop-blur-3xl
  p-16 md:p-20
  text-center
  "
        >
          <div
            className="
            w-20 h-20
            mx-auto
            mb-6
            rounded-3xl
            flex items-center justify-center
            bg-white/[0.03]
            border border-white/10
            "
          >
            <Search size={30} className="text-slate-500" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold">No Jobs Found</h2>

          <p className="text-slate-500 mt-3 text-sm">Try changing filters or search terms.</p>
        </div>
      )}

      {!loading && gigs.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
         {processedGigs
.sort(
(a,b)=>
b.matchScore -
a.matchScore
)
.map(
(gig)=>(
<GigCard
key={gig._id}
gig={gig}
/>
))}
        </div>
      )}
    </div>
  );
}