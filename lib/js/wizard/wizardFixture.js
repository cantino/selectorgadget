var defaults = {
  info_card: {
    here: "I'm there!",
    close: "Let me browse to it!",
    none: false
  },
  selector_card: {
    prompt: "Please select the %s on this page.",
    close: false
    none: "There are no %s to select." 
  }
}

var serverData = {
  selectors: {
    details: "a.something"
  },
  cards: [
    {
      prompt: "Please navigate to the first page of the jobs from this site",
    },
    {
      name: "details"
      prompt: "Select the links/buttons to the detail pages",
      none: "The details of the jobs are all on this page",
    },
    {
      name: "pagination",
      prompt: "Select the links/buttons to the more jobs (pagination)",
      none: "There aren't any pagination links to select"
    },
    {
      skip_if: function(){
        return this.selectors.details == "";
      },
      prompt: "Please navigate to the details of the first job",
    },
    {
      prompt: "Select the title of the job",
      name: "title",
      none: false,
      close: "You're sol, gooodbye!!!"
    },
    {
      prompt: "Select the location of the job",
      name: "location",
      none: "Skip"
    }
  ]
}