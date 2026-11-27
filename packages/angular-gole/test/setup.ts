// JIT compiler: the tests compile the directives and their host templates at run time.
import "@angular/compiler";
import { TestBed } from "@angular/core/testing";
import { BrowserTestingModule, platformBrowserTesting } from "@angular/platform-browser/testing";
import { afterEach } from "vitest";

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
// Angular only resets the TestBed by itself when the test functions are globals.
afterEach(() => TestBed.resetTestingModule());
