// Server-only project sync controls. This is an allow/exclude/override list,
// not a list of projects; eligible public repositories are discovered by ID.
export const githubProjectConfig = {
  excludedRepoIds: ["1399290912", "854193710"],
  excludedRepoNames: ["portfolio"],
  includeArchived: false,
  includeForks: true,
  approvedRepositories: [],
  featuredRepoIds: ["1391128742"],
  sort: "updated",
  overrides: {
    "1391128742": { title: "Basa Vara" },
  },
};
