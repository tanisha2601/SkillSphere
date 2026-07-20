import React from "react";

const glassInput =
  "w-full rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 px-4 py-2.5 outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all";

export default function GigFilters({
  filters,
  onChange,
  onReset,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      {/* Search */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Search
        </label>

        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={onChange}
          placeholder="Search gigs..."
          className={glassInput}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Category
        </label>

        <select
          name="category"
          value={filters.category}
          onChange={onChange}
          className={glassInput}
        >
          <option value="" className="bg-slate-900">All Categories</option>
          <option value="Web Development" className="bg-slate-900">Web Development</option>
          <option value="Mobile Development" className="bg-slate-900">Mobile Development</option>
          <option value="UI/UX Design" className="bg-slate-900">UI/UX Design</option>
          <option value="Graphic Design" className="bg-slate-900">Graphic Design</option>
          <option value="Content Writing" className="bg-slate-900">Content Writing</option>
          <option value="Digital Marketing" className="bg-slate-900">Digital Marketing</option>
        </select>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Sort By
        </label>

        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={onChange}
          className={glassInput}
        >
          <option value="" className="bg-slate-900">Newest</option>
          <option value="oldest" className="bg-slate-900">Oldest</option>
          <option value="budget_asc" className="bg-slate-900">Budget: Low → High</option>
          <option value="budget_desc" className="bg-slate-900">Budget: High → Low</option>
        </select>
      </div>

      {/* Reset */}
      <div className="flex items-end">
        <button
          onClick={onReset}
          type="button"
          className="
          w-full
          py-2.5
          rounded-2xl
          bg-gradient-to-r
          from-blue-600
          to-cyan-500
          text-white
          font-semibold
          shadow-lg shadow-cyan-500/20
          hover:scale-[1.02]
          active:scale-95
          transition-all
          "
        >
          Reset Filters
        </button>
      </div>

    </div>
  );
}