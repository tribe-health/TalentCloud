import { Selector } from "testcafe";
import { applicantUser, adminUser } from "./helpers/roles";

fixture(`Critical - Applicant Profile`).page(`talent.test`);

// Skip when writing new tests
// fixture.skip(`Critical - Applicant Profile`);

test("Applicant Profile - My Skills", async t => {
  await t
    // TODO: Applicant user account without prepopulated skills.
    // Logged in as admin (empty skills page).
    .useRole(adminUser)
    // Go to My Skills page.
    .navigateTo("/profile/skills")
    .expect(Selector("h1").withText("My Skills").visible)
    .ok()
    // Add soft skill (Passion).
    .click(Selector("button").withText("Add soft skill"))
    .click(Selector("select").withAttribute("name", "skill_id"))
    .click(Selector("option").withAttribute("value", "24"))
    .click(
      Selector(".form__radio-group-span").withText("Deep Level Demonstration"),
    )
    .typeText(
      Selector("textarea").withAttribute("name", "description"),
      "Eating lots of passionfruit.",
    )
    // Check skill help modal before saving.
    .click(Selector("button").withText("(Need help? See example.)"))
    .expect(Selector("h3").withText("Writing my application").visible)
    .ok()
    .click(Selector("button").withText("Got it!"))
    .click(Selector("button").withText("Save Skill"))
    // Add hard skill (Docker).
    .click(Selector("button").withText("Add hard skill"))
    .click(
      Selector("select").withAttribute(
        "id",
        "skill_declarations[new][hard][1]skillSelection",
      ),
    )
    .click(Selector("option").withAttribute("value", "12"))
    .click(Selector(".form__radio-group-span").withText("Advanced"))
    .typeText(
      Selector("textarea").withAttribute(
        "id",
        "skill_declarations[new][hard][1]skillDescription",
      ),
      "Sailing the high seas.",
    )
    .pressKey("tab tab enter")
    // Save and refresh.
    .navigateTo("/profile/skills")
    .expect(Selector("span").withText("Passion").visible)
    .ok()
    .expect(Selector("span").withText("Docker").visible)
    .ok();
  /* Delete a skill.
    Issues with selectors, so lots of keyboard commands
    Failing in Firefox
    .setNativeDialogHandler(() => null)
    .click(Selector("span").withText("Passion"))
    .pressKey("tab tab tab tab tab enter")
    .expect(Selector("h1").withText("Delete this Skill?"))
    .ok()
    .pressKey("tab tab tab enter")
    .expect(Selector("h1").withText("My Skills").visible)
    .ok()
    .expect(Selector("span").withText("Passion").exists)
    .notOk(); */
});

test("Applicant Profile - My Experience", async t => {
  await t
    // Logged in as applicant.
    .useRole(applicantUser)
    // Go to My Experience page.
    .navigateTo("/profile/experience")
    .expect(Selector("h1").withText("My Experience").visible)
    .ok()
    // Add new diploma.
    .click(Selector("button").withText("Add Diploma/Degree"))
    .click(Selector("select").withAttribute("id", "degrees[new][1]degreeType"))
    .click(
      Selector("select")
        .withAttribute("id", "degrees[new][1]degreeType")
        .find("option")
        .withAttribute("value", "4"),
    )
    .typeText(
      Selector("input").withAttribute("id", "degrees[new][1]degreeArea"),
      "Computer Science",
    )
    .typeText(
      Selector("input").withAttribute("id", "degrees[new][1]degreeInstitution"),
      "University of Phoenix",
    )
    .click(Selector("button").withAttribute("value", "degrees[new][1]"))
    .expect(Selector("span").withText("Phd, Computer Science").visible)
    .ok()
    // Add new course.
    .click(Selector("button").withText("Add Course/Certification"))
    .typeText(
      Selector("input").withAttribute("id", "courses[new][1]courseName"),
      "Advanced Memes",
    )
    .typeText(
      Selector("input").withAttribute("id", "courses[new][1]courseInstitution"),
      "Yale University",
    )
    .click(
      Selector("select").withAttribute("id", "courses[new][1]courseStatus"),
    )
    .click(
      Selector("select")
        .withAttribute("id", "courses[new][1]courseStatus")
        .find("option")
        .withAttribute("value", "2"),
    )
    .click(Selector("button").withAttribute("value", "courses[new][1]"))
    .expect(Selector("span").withText("Advanced Memes").visible)
    .ok()
    // Add new experience.
    .click(Selector("button").withText("Add Equivalent Experience"))
    .typeText(
      Selector("input").withAttribute("id", "work_experiences[new][1]workRole"),
      "The boss",
    )
    .typeText(
      Selector("input").withAttribute(
        "id",
        "work_experiences[new][1]workCompany",
      ),
      "My house",
    )
    .typeText(
      Selector("textarea").withAttribute(
        "id",
        "work_experiences[new][1]workDescription",
      ),
      "It was the best of times, it was the worst of times.",
    )
    .click(
      Selector("button").withAttribute("value", "work_experiences[new][1]"),
    )
    .expect(Selector("span").withText("The boss, My house").visible)
    .ok();
});

test("Applicant Profile - My Work Samples", async t => {
  await t
    // Logged in as applicant.
    .useRole(applicantUser)
    // Go to My Work Samples page.
    .navigateTo("/profile/portfolio")
    .expect(Selector("h1").withText("My Work Samples").visible)
    .ok()
    // Add new work sample.
    .click(Selector("button").withText("Add Sample"))
    .typeText(
      Selector("input").withAttribute("id", "work_samples[1]sampleName"),
      "Cool Funny",
    )
    .click(Selector("select").withAttribute("id", "work_samples[1]sampleType"))
    .click(
      Selector("select")
        .withAttribute("id", "work_samples[1]sampleType")
        .find("option")
        .withAttribute("value", "3"),
    )
    .typeText(
      Selector("input").withAttribute("id", "work_samples[1]sampleLink"),
      "http://www.coolfunny.com",
    )
    .typeText(
      Selector("textarea").withAttribute(
        "id",
        "work_samples[1]sampleDescription",
      ),
      "A website that is both cool and funny.",
    )
    .pressKey("tab tab tab enter")
    .navigateTo("/profile/portfolio")
    .expect(Selector("button").withText("Cool Funny").visible)
    .ok();
});

test("Applicant Profile - About Me", async t => {
  await t
    // Logged in as applicant.
    .useRole(applicantUser)
    // Go to About Me page.
    .navigateTo("/profile/about")
    .expect(Selector("h1").withText("About Me").visible)
    .ok()
    // Change password.
    .typeText(
      Selector(".form__input").withAttribute("name", "old_password"),
      "password",
    )
    .typeText(
      Selector(".form__input").withAttribute("name", "new_password"),
      "Password123!@#",
    )
    .typeText(
      Selector(".form__input").withAttribute(
        "name",
        "new_password_confirmation",
      ),
      "Password123!@#",
    )
    // Edit social media / tagline.
    .selectText(
      Selector(".form__input").withAttribute("name", "twitter_username"),
    )
    .typeText(
      Selector(".form__input").withAttribute("name", "twitter_username"),
      "realDonaldTrump",
    )
    .selectText(Selector(".form__input").withAttribute("name", "linkedin_url"))
    .typeText(
      Selector(".form__input").withAttribute("name", "linkedin_url"),
      "https://www.linkedin.com/in/tristanwiseman/",
    )
    .selectText(Selector(".form__input").withAttribute("name", "tagline"))
    .typeText(
      Selector(".form__input").withAttribute("name", "tagline"),
      "I didn't do it.",
    )
    .click(Selector("button").withText("Save Changes"))
    // Relog to check password change.
    .click(Selector("a").withText("Logout"))
    .click(Selector("a").withText("Login"))
    .typeText(Selector("#email"), "applicant@test.com")
    .typeText(Selector("#password"), "Password123!@#")
    .click(Selector("button").withText("Login"))
    .expect(Selector("a").withText("My Applications").visible)
    .ok();
});

// Returns an integer between min/max.
function spinTheWheel() {
  const min = 777;
  const max = 7777;

  const random = Math.floor(Math.random() * (+max - +min)) + +min;

  return random;
}

// Returns email with random integer.
function randomEmail() {
  const prefix = "applicant";
  const suffix = "@test.com";
  const rng = spinTheWheel();

  let email = prefix;
  email += rng;
  email += suffix;

  return email;
}

fixture(`Critical - Registration`).page(`talent.test`);
// Skip when writing new tests
// fixture.skip(`Critical - Registration`);

test("Registration - Applicant", async t => {
  await t
    .click(Selector("a").withText("Register"))
    .typeText(Selector("#name"), "Test Cafe")
    .typeText(Selector("#email"), randomEmail())
    .typeText(Selector("#password"), "Password123!@#")
    .typeText(Selector("#password-confirm"), "Password123!@#")
    .click(Selector("button").withText("Register"))
    .expect(Selector("a").withText("My Applications").visible)
    .ok();
});
