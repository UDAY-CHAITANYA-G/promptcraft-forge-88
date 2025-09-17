# Code Review Checklist

## 📋 **Overview**
This checklist ensures code quality, maintainability, and consistency across the PromptCraft Forge project.

---

## 🔍 **Pre-Review Checklist**

### **Before Starting Review**
- [ ] Code compiles without errors
- [ ] All tests pass (if applicable)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in browser

---

## 🎯 **Code Quality Standards**

### **TypeScript & JavaScript**
- [ ] **No `any` types** - Use proper TypeScript interfaces
- [ ] **Proper error handling** - Use `try-catch` blocks and proper error types
- [ ] **Function definitions** - Functions defined before they're used
- [ ] **Type safety** - All variables and functions have proper types
- [ ] **No unused imports** - Remove unused imports and variables
- [ ] **Consistent naming** - Use camelCase for variables, PascalCase for components

### **React Best Practices**
- [ ] **Hook dependencies** - All `useEffect` dependencies are correct
- [ ] **useCallback usage** - Functions used in dependencies are wrapped in `useCallback`
- [ ] **Component structure** - Components are properly structured and focused
- [ ] **Props validation** - Props have proper TypeScript interfaces
- [ ] **State management** - State is managed appropriately
- [ ] **Event handlers** - Event handlers have proper types

### **Performance**
- [ ] **Unnecessary re-renders** - Components don't re-render unnecessarily
- [ ] **Memory leaks** - No memory leaks from uncleaned subscriptions
- [ ] **Bundle size** - No unnecessary large dependencies
- [ ] **Lazy loading** - Heavy components are lazy-loaded when appropriate

---

## 🏗️ **Architecture & Structure**

### **File Organization**
- [ ] **Proper file structure** - Files are in correct directories
- [ ] **Import organization** - Imports are properly organized
- [ ] **Component separation** - Components are properly separated by concern
- [ ] **Service layer** - Business logic is in service files, not components

### **Code Organization**
- [ ] **Single responsibility** - Each function/component has one responsibility
- [ ] **DRY principle** - No code duplication
- [ ] **Separation of concerns** - UI, business logic, and data are separated
- [ ] **Consistent patterns** - Code follows established patterns

---

## 🔒 **Security & Data Handling**

### **Security**
- [ ] **No hardcoded secrets** - No API keys or secrets in code
- [ ] **Input validation** - User inputs are properly validated
- [ ] **XSS prevention** - No direct HTML injection
- [ ] **CSRF protection** - API calls are properly protected
- [ ] **Database security** - RLS policies enabled, data encryption for sensitive fields
- [ ] **API key encryption** - API keys encrypted before database storage

### **Data Handling**
- [ ] **Error boundaries** - React error boundaries are in place
- [ ] **Loading states** - Proper loading states for async operations
- [ ] **Error states** - Proper error handling and display
- [ ] **Data validation** - Data is validated before use
- [ ] **Database operations** - Proper error handling for database operations
- [ ] **Type safety** - Use generated TypeScript types for database operations
- [ ] **RLS compliance** - Database operations respect Row Level Security

---

## 🎨 **UI/UX Standards**

### **Accessibility**
- [ ] **ARIA labels** - Proper ARIA labels for screen readers
- [ ] **Keyboard navigation** - All interactive elements are keyboard accessible
- [ ] **Color contrast** - Sufficient color contrast for readability
- [ ] **Focus management** - Proper focus management

### **Design Consistency**
- [ ] **Component library** - Uses established UI components
- [ ] **Consistent styling** - Follows design system
- [ ] **Responsive design** - Works on all screen sizes
- [ ] **Loading states** - Proper loading indicators

---

## 🧪 **Testing & Quality Assurance**

### **Code Testing**
- [ ] **Unit tests** - Critical functions have unit tests
- [ ] **Integration tests** - Key user flows are tested
- [ ] **Error scenarios** - Error cases are tested
- [ ] **Edge cases** - Edge cases are handled

### **Manual Testing**
- [ ] **User flows** - All user flows work as expected
- [ ] **Cross-browser** - Works in major browsers
- [ ] **Mobile responsive** - Works on mobile devices
- [ ] **Performance** - App performs well under normal usage

---

## 📚 **Documentation & Comments**

### **Code Documentation**
- [ ] **Function comments** - Complex functions have comments
- [ ] **Component documentation** - Components have proper JSDoc
- [ ] **README updates** - README is updated if needed
- [ ] **API documentation** - API endpoints are documented

### **Code Comments**
- [ ] **Complex logic** - Complex business logic is commented
- [ ] **Temporary code** - Temporary code is marked with TODO/FIXME
- [ ] **Non-obvious code** - Non-obvious code is explained
- [ ] **Performance notes** - Performance considerations are noted

---

## 🔧 **Configuration & Environment**

### **Environment Setup**
- [ ] **Environment variables** - Proper use of environment variables
- [ ] **Configuration files** - Configuration is properly managed
- [ ] **Build configuration** - Build process is properly configured
- [ ] **Development setup** - Development environment is properly set up

### **Dependencies**
- [ ] **Dependency updates** - Dependencies are up to date
- [ ] **Security vulnerabilities** - No known security vulnerabilities
- [ ] **Unused dependencies** - No unused dependencies
- [ ] **License compliance** - All dependencies are properly licensed

---

## 🚀 **Deployment & Production**

### **Production Readiness**
- [ ] **Environment variables** - All required environment variables are set
- [ ] **Build optimization** - Build is optimized for production
- [ ] **Error monitoring** - Error monitoring is in place
- [ ] **Performance monitoring** - Performance monitoring is configured

### **Deployment Checklist**
- [ ] **Database migrations** - Database migrations are ready
- [ ] **API endpoints** - All API endpoints are working
- [ ] **Static assets** - Static assets are properly served
- [ ] **SSL/HTTPS** - SSL/HTTPS is properly configured

---

## 📝 **Review Process**

### **Review Steps**
1. **Self-review** - Author reviews their own code first
2. **Automated checks** - Run linting, tests, and build
3. **Peer review** - Another developer reviews the code
4. **Testing** - Manual testing of the changes
5. **Approval** - Code is approved for merge

### **Review Guidelines**
- [ ] **Constructive feedback** - Provide constructive, helpful feedback
- [ ] **Focus on code** - Focus on code quality, not personal preferences
- [ ] **Explain reasoning** - Explain why changes are suggested
- [ ] **Be respectful** - Maintain a respectful, professional tone

---

## 🎯 **Common Issues to Watch For**

### **Critical Issues**
- [ ] **Memory leaks** - Unsubscribed event listeners or timers
- [ ] **Infinite loops** - useEffect dependencies causing infinite loops
- [ ] **Type errors** - TypeScript errors that could cause runtime issues
- [ ] **Security vulnerabilities** - XSS, CSRF, or data exposure issues

### **Code Quality Issues**
- [ ] **Large functions** - Functions that are too long or complex
- [ ] **Deep nesting** - Code that is too deeply nested
- [ ] **Magic numbers** - Hardcoded numbers without explanation
- [ ] **Inconsistent naming** - Inconsistent variable or function naming

---

## ✅ **Final Checklist**

### **Before Merging**
- [ ] All checklist items are reviewed
- [ ] Code passes all automated checks
- [ ] Manual testing is completed
- [ ] Documentation is updated
- [ ] No critical issues remain
- [ ] Code is ready for production

---

## 📞 **Getting Help**

### **When to Ask for Help**
- Unclear requirements or specifications
- Complex architectural decisions
- Security concerns
- Performance issues
- Integration problems

### **Resources**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Development Team
